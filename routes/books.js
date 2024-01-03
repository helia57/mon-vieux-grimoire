const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const reqlimite = require('../middleware/reqlimite');
const booksCtrl = require('../controllers/books');



router.get('/', reqlimite, booksCtrl.getAllBooks);
router.get("/bestrating", reqlimite, booksCtrl.getBestRating);
router.get('/:id', reqlimite,  booksCtrl.getOneBook);

router.post('/', reqlimite, auth, multer, multer.resizeImage, booksCtrl.createBook); 
router.post('/:id/rating', reqlimite, auth, booksCtrl.averageRating);
router.put('/:id', reqlimite, auth, multer,multer.resizeImage, booksCtrl.modifyBook);
router.delete('/:id', reqlimite, auth, booksCtrl.deleteBook);


module.exports = router;
