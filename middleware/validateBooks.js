const sharp = require('sharp');

const validateBookFields = async (req, res, next) => {
    const { title, author, imageUrl, year, genre } = req.body;
  
    // Vérifier si les champs requis sont présents
    if (!title || !author || !imageUrl || !year || !genre) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs." });
    }
  
    // Expression régulière pour autoriser seulement les lettres, chiffres, et espaces pour le titre et l'auteur
    const nameRegex = /^[a-zA-Z0-9\s]+$/;
  
    // Expression régulière pour vérifier le format de l'URL de l'image
    const imageUrlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg))/;
  
    // Expression régulière pour vérifier que l'année est un nombre à quatre chiffres
    const yearRegex = /^\d{4}$/;
  
    // Vérifier si le titre et l'auteur respectent les expressions régulières et les limites de longueur
    if (!nameRegex.test(title) || !nameRegex.test(author) || title.length > 25 || author.length > 15) {
      return res.status(400).json({ message: "Le titre doit avoir au maximum 25 caractères, l'auteur au maximum 15 caractères, et ne peuvent contenir que des lettres, des chiffres et des espaces." });
    }
  
    // Vérifier si l'URL de l'image respecte l'expression régulière
    if (!imageUrlRegex.test(imageUrl)) {
      return res.status(400).json({ message: "Veuillez fournir une URL d'image valide (png, jpg, jpeg)." });
    }
  
    // Vérifier si l'année respecte l'expression régulière
    if (!yearRegex.test(year)) {
      return res.status(400).json({ message: "Veuillez fournir une année valide (format: YYYY)." });
    }
  
    // Éliminer les espaces inutiles dans le titre et l'auteur
    req.body.title = title.trim();
    req.body.author = author.trim();
  
    // Vérifier si le livre existe déjà dans la base de données
    try {
      const existingBook = await Book.findOne({ title: req.body.title, author: req.body.author });
      if (existingBook) {
        return res.status(400).json({ message: "Ce livre existe déjà !" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Une erreur est survenue.", error });
    }
  
    next();
  };
  
  module.exports = validateBookFields;
  