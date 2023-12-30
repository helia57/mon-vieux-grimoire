const Book = require('../models/Book');
const fs = require('fs');




exports.getAllBooks = (req, res, next) => {
  // Logique pour obtenir la liste des livres depuis la base de données
  Book.find()
      .then((books) => {
          if (books.length === 0) {
              return res.status(404).json({
                  message: "Aucun livre trouvé.",
              });
          }

          res.status(200).json(books);
      })
      .catch((error) => {
          res.status(500).json({
              message:
                  "Une erreur est survenue lors de la récupération des livres.",
              error: error,
          });
      });
};


exports.averageRating = (req, res, next) => {
  const bookId = req.params.id;
  const { userId, rating } = req.body;

 
  if (rating < 0 || rating > 5) {
      return res.status(400).json({
          error: "INVALID_RATING",
          message: "La note doit être un chiffre entre 0 et 5.",
      });
  }

  Book.findById(bookId)
      .then((book) => {
          if (!book) {
              throw new Error("BOOK_NOT_FOUND");
          }

      
          return Book.findOne({ _id: bookId, "ratings.userId": userId }).then(
              (alreadyRated) => {
                  if (alreadyRated) {
                      throw new Error("ALREADY_RATED");
                  }

                 
                  const grades = book.ratings.map((rating) => rating.grade);
                  const sumRatings = grades.reduce(
                      (total, grade) => total + grade,
                      0
                  );

                  const newTotalRating = sumRatings + rating;
                  const newAverageRating = Number(
                      (newTotalRating / (book.ratings.length + 1)).toFixed(2)
                  );

                 
                  book.ratings.push({ userId, grade: rating });
                  book.averageRating = newAverageRating;

                 
                  return book.save().then((updatedBook) => {
                      res.status(201).json({
                          ...updatedBook._doc,
                          id: updatedBook._doc._id,
                      });
                  });
              }
          );
      })

     
      .catch((error) => {
          if (error.message === "BOOK_NOT_FOUND") {
              return res.status(404).json({
                  error: error.message,
                  message: "Livre introuvable.",
              });
          } else if (error.message === "ALREADY_RATED") {
              return res.status(403).json({
                  error: error.message,
                  message: "Vous avez déjà noté ce livre.",
              });
          } else {
              return res.status(500).json({
                  error: error.message,
                  message:
                      "Une erreur est survenue lors de la notation du livre.",
              });
          }
      });
};


// Logique pour obtenir la liste des 3 livres ayant la meilleurs note depuis la base de données
exports.getBestRating = (req, res, next) => {
  Book.find().sort({averageRating: -1}).limit(3)
      .then((books)=>res.status(200).json(books))
      .catch((error)=>res.status(404).json({ error }));
};
const validateBookFields = ( title, author, year, genre ) => {
    
  const errors = [];
  // Expression régulière pour autoriser seulement les lettres, chiffres, et & ,espaces pour le titre et l'auteur
  const nameRegex = /^[a-zA-Z0-9\s&]{3,25}$/;
  const genreRegex = /^[a-zA-Z0-9\s&]{3,10}$/;
  // Expression régulière pour vérifier que l'année est un nombre à quatre chiffres
  const yearRegex = /^\s*\d{4}\s*$/;
 

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

return errors;
};

const deleteImage = (imagePath) => {
  try {
      fs.unlinkSync(imagePath);
  } catch (error) {
      console.error("Erreur lors de la suppression de l'image", error);
  }
};

// Logique pour obtenir creation d'un livre 
exports.createBook = async (req, res, next) => {
  try {
      const bookData = JSON.parse(req.body.book);

      delete bookData._id;
      delete bookData._userId;

      const { title, author, genre, year } = bookData;

      const trimmedTitle = title.trim();
      const trimmedAuthor = author.trim();
      const trimmedGenre = genre.trim();
      const trimmedYear = year.trim();

      const errors = validateBookFields(
          trimmedTitle,
          trimmedAuthor,
          trimmedGenre,
          trimmedYear
      );

      
      // Vérifie si le livre existe déjà en vérifiant le titre et l'auteur
      const existingBook = await Book.findOne({
          title: trimmedTitle,
          author: trimmedAuthor,
      });

      if (existingBook) {
        console.log('Ce livre existe déjà.');
          // Supprime l'image si le livre existe déjà
          if (req.file) {
              deleteImage(req.file.path);
          }
          throw new Error("Ce livre existe déjà.");
      }

      // Vérifie si la note est nulle et force "ratings" à être vide
      if (
          bookData.ratings &&
          bookData.ratings.length === 1 &&
          bookData.ratings[0].grade === 0
      ) {
          bookData.ratings = [];
          bookData.averageRating = 0;
      }

      const book = new Book({
          ...bookData,
          title: trimmedTitle,
          author: trimmedAuthor,
          genre: trimmedGenre,
          year: trimmedYear,
          userId: req.auth.userId,
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
          }`,
      });

      await book.save();

      res.status(201).json({
          message: "Livre créé avec succès !",
      });
  } catch (error) {
      // Supprime l'image en cas d'erreur
      if (req.file) {
          deleteImage(req.file.path);
          
      }
      res.status(400).json({
          error: error.message,
      });
  }
};


// Logique pour obtenir un livre depuis la base de données
exports.getOneBook = (req, res, next) => {
    Book.findOne({
    _id: req.params.id
  }).then(
    (book) => {
      res.status(200).json(book);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};
// Logique pour modifier un livre depuis la base de données
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };


  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
            Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};


// Logique pour supprimer un livre de la base de données

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

