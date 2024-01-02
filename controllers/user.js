const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');




 // Logique s'authentifier 


const isValidEmail = (email) => {
	const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
	return emailRegex.test(email);
};


const isStrongPassword = (password) => {
	const minLength = 8;
	const hasUpperCase = /[A-Z]/.test(password);
	const hasLowerCase = /[a-z]/.test(password);
	const hasNumbers = /\d/.test(password);
	const hasSpecialChars = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password);

	return (
		password.length >= minLength &&
		hasUpperCase &&
		hasLowerCase &&
		hasNumbers &&
		hasSpecialChars
	);
};
exports.signup = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;

	if (!isValidEmail(email)) {
		return res
			.status(400)
			.json({ error: "L'adresse e-mail n'est pas valide." });
	}

	if (!isStrongPassword(password)) {
		return res
			.status(400)
			.json({ error: "Le mot de passe est trop faible" });
	}

	bcrypt
		.hash(req.body.password, 10)
		.then((hash) => {
			const user = new User({
				email: email,
				password: hash,
			});
			user.save()
				.then(() =>
					res.status(201).json({ message: "Utilisateur cree !" })
				)
				.catch((error) => res.status(400).json({ error }));
		})
		.catch((error) => res.status(500).json({ error }));
};


exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN_KEY,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};