const express = require('express');

const app = express();
const mongoose = require('mongoose');
const path = require('path');
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');


mongoose.connect('mongodb+srv://Elia_MonVieuxGrimoire:THrHY.X6Hb8dcvd@cluster0.izwfjad.mongodb.net/')
  
 
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));






app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// intercepte tous les requetes qui ont un "json" type et met à disposition sur l'objet requete dans req.body
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/books', booksRoutes);





module.exports = app;
