 // Expression régulière pour autoriser seulement les lettres, chiffres, et & ,espaces pour le titre et l'auteur
 const nameRegex = /^[a-zA-Z0-9\s&]{3,25}$/;
 const genreRegex = /^[a-zA-Z0-9\s&]{3,10}$/;
  
  
 // Expression régulière pour vérifier que l'année est un nombre à quatre chiffres
 const yearRegex = /^\s*\d{4}\s*$/;

 
 const validateBookFields = async (req, res, next) => {
    try {
        const { title, author, year, genre } = req.body;

        const errors = [];

        // Vérifier si le titre respecte l'expression régulière
        if (title && !nameRegex.test(title)) {
            errors.push("Le format du titre est invalide.");
        }

        // Vérifier si l'auteur respecte l'expression régulière
        if (author && !nameRegex.test(author)) {
            errors.push("Le format de l'auteur est invalide.");
        }

        // Vérifier si le genre respecte l'expression régulière
        if (genre && !genreRegex.test(genre)) {
            errors.push("Le format du genre est invalide.");
        }

        // Vérifier si l'année respecte l'expression régulière
        if (year && !yearRegex.test(year)) {
            errors.push("L'année doit être au format YYYY.");
        }

        // Afficher les erreurs dans la console
        if (errors.length > 0) {
            console.log("Validation échouée :", errors);
            return res.status(400).json({ message: "Erreur dans les champs.", errors });
        }

        // Si aucune erreur, la validation est réussie
        console.log("Validation réussie !");
        next();
    } catch (error) {
        console.error("Une erreur est survenue lors de la validation :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

module.exports = validateBookFields;


