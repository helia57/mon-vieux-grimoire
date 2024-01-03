const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const reqlimite = require('../middleware/reqlimite');

router.post('/signup', reqlimite,userCtrl.signup);
router.post('/login', reqlimite, userCtrl.login);

module.exports = router;