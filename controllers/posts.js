// database parameters
const db = require('../db/db-groupomania');

// filesystem package
const fs = require('fs');

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

exports.createPost = (req, res, next) => {
    const request = 'INSERT INTO posts (date_cre, texte, user_id, user_name) VALUES (CURRENT_TIMESTAMP() ,?,?,?)';
    const values = [req.body.texte, req.body.user_id, req.body.user_name];
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

exports.deletePost = (req, res, next) => {
    const request = 'DELETE FROM posts WHERE id = ?';
    const values = [req.body.id];
    db.query(
        request, values,
        function (err, results) {
            if (err) throw err;
            res.json({
                results,
                status: 200,
                message: "post supprimé avec succès"
            })
        })
};

exports.updatePost = (req, res, next) => {
    const request = 'UPDATE posts SET texte = ? WHERE id = ?';
    const values = [req.body.texte, req.body.id];
    db.query(
        request, values,
        function (err, results) {
            if (err) throw err;
            res.json({
                results,
                status: 200,
                message: "post modifié avec succès"
            })
        })
};