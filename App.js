const express = require('express');

const app = express();

const path = require('path');
const helmet = require("helmet"); // Contre les attaques XSS (cross-site scripting attacks)
const sanitize = require("express-mongo-sanitize");


// intercepte tous les requetes qui ont un "json" type et met à disposition sur l'objet requete dans req.body
app.use(express.json());


//Middleware de sécurité // Pour éviter les injections SQL
app.use(sanitize()); 
app.use(helmet({ crossOriginResourcePolicy: false })); // Renforce la sécurité par diverses en-têtes HTTP (Content-Security-Policy, etc..)



// Autorise les requêtes Cross Origin
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

// Gestion de l'api route
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/books', booksRoutes);

// Gestion des erreurs
app.use((error, req, res, next) => {
	console.error("Error", error);
	res.status(500).json({ error: "Une erreur est survenue" });
});





module.exports = app;
