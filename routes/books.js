const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const booksCtrl = require('../controllers/books');



router.get('/', booksCtrl.getAllBooks);
router.get("/bestrating",booksCtrl.getBestRating);
router.get('/:id', booksCtrl.getOneBook);

router.post('/', auth, multer, multer.resizeImage, booksCtrl.createBook); 
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);


module.exports = router;
