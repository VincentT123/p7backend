// routeur express definissant les routes à suivre pour les requêtes d'inscription et de connexion
// sur la table 'users'

const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth');

router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);

module.exports = router;