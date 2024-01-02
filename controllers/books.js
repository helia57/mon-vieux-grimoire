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


// Logique pour obtenir creation d'un livre 
exports.createBook = (req, res, next) => {
	const bookObject = JSON.parse(req.body.book);
	delete bookObject._id;
	delete bookObject._userId;

	const book = new Book({
		...bookObject,
		userId: req.auth.userId,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${
			req.file.filename
		}`,
	});

	book.save()
		.then(() => res.status(201).json({ message: "Objet enregistre !" }))
		.catch((error) => res.status(400).json({ error }));
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

