// framework facilitant la création de serveur node
const express = require('express');

// permet d'accéder au path du serveur pour le stockage des images en statique
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postsRoutes = require('./routes/posts');

// package permettant de sécuriser des données en les déportant vers le fichier .env
require('dotenv').config()

const app = express();

// middleware permettant de gérer les requêtes du frontend en extrayant le corps JSON
app.use(express.json());

// headers permettant au frontend et à l'API de communiquer par http
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', `${process.env.CLIENT_URL}`);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// routes utilisées pour les demandes envoyées depuis le frontend avec un dossier statique pour les images
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/groupomania/auth', authRoutes);
app.use('/groupomania/user', userRoutes);
app.use('/groupomania/posts', postsRoutes);

module.exports = app;