const db = require('../db/db-groupomania');

// package permettant d'utiliser le système de fichier du serveur
const fs = require('fs');


// fonction utilisée pour la requête de type GET demandant les données de toutes les sauces
exports.getAllPosts = (req, res, next) => {
    db.query(
    'SELECT * FROM posts ORDER BY date_pub DESC',
    function (err, result) {
        if (err) throw err;
        res.json({
            result,
            status: 200,
            message: "liste des posts transmise avec succès"
        })
    })
};
