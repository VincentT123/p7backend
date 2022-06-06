const db = require('../db/db-groupomania');

// package permettant d'utiliser le système de fichier du serveur
const fs = require('fs');


// requête : liste des posts
exports.getAllPosts = (req, res, next) => {
    const request = 'SELECT * FROM posts ORDER BY date_cre DESC';
    db.query(
        request,
        function (err, results) {
            if (err) throw err;
            res.json({
                results,
                status: 200,
                message: "liste des posts transmise avec succès"
            })
        })
};

// requête : supprimer un post
exports.createPost = (req, res, next) => {
    const request = 'INSERT INTO posts (date_cre, texte, user_id, user_name) VALUES (?,?,?,?)';
    const values = [req.body.date_cre, req.body.texte, req.body.user_id, req.body.user_name];
    db.query(
        request, values,
        function (err, results) {
            if (err) throw err;
            res.json({
                results,
                status: 200,
                message: "post créé avec succès"
            })
        })
};

// requête : créer un post
exports.deletePost = (req, res, next) => {
    const request = 'DELETE FROM posts WHERE id = ?';
    const value = [req.body.id];
    db.query(
        request, value,
        function (err, results) {
            if (err) throw err;
            res.json({
                results,
                status: 200,
                message: "post supprimé avec succès"
            })
        })
};
