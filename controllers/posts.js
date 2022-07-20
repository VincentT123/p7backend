// database parameters
const db = require('../db/db-groupomania');

// filesystem package
const fs = require('fs');

// récupère la liste des posts
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

// création d'un post avec si nécessaire l'adresse url de l'image associée
exports.createPost = (req, res, next) => {
    const data = JSON.parse(req.body.message);
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null;
    const request = 'INSERT INTO posts (date_cre, texte, user_id, user_name, url_media) VALUES (CURRENT_TIMESTAMP() ,?,?,?,?)';
    const values = [data.texte, data.user_id, data.user_name, imageUrl];
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

// suppression du post et de l'image associée si elle existe + suppression des images des comments
// associés supprimés automatiquement par 'on cascade'
exports.deletePost = (req, res, next) => {
    const request = 'SELECT url_media FROM posts WHERE id = ?';
    const values = [req.body.id];
    db.query(
        request, values,
        function (err, results) {
            if (err) throw err;
            if (results[0] != undefined) {
                const urlPost = results[0].url_media;
                const request2 = 'SELECT url_media FROM comments WHERE post_id = ?';
                const values2 = [req.body.id];
                db.query(
                    request2, values2,
                    function (err, results) {
                        if (err) throw err;
                        if (results != undefined) {
                            results.forEach((result) => {
                                const url = result.url_media;
                                if (url != null) {
                                    const filename = url.split('/images/')[1];
                                    fs.unlink(`images/${filename}`, (err) => {
                                        if (err) throw err;
                                        console.log("image comment supprimée avec succès")
                                    })
                                }
                            })
                        }
                        const request3 = 'DELETE FROM posts WHERE id = ?';
                        const values3 = [req.body.id];
                        db.query(
                            request3, values3,
                            function (err, results) {
                                if (err) throw err;
                                if (urlPost != null) {
                                    const filename = urlPost.split('/images/')[1];
                                    fs.unlink(`images/${filename}`, (err) => {
                                        if (err) throw err;
                                        console.log("image post supprimée avec succès")
                                    })
                                }
                                res.json({
                                    results,
                                    status: 200,
                                    message: "post supprimé avec succès"
                                })
                            }
                        )
                    })
            }
        })
};

// mise à jour d'un post en séparant le traitement selon la présence ou non d'une image
// si l'image a été supprimée en front alors suppression de l'image du serveur
exports.updatePost = (req, res, next) => {
    const data = JSON.parse(req.body.message);
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null;
    if (imageUrl === null && data.supprImg === false) {
        const request = 'UPDATE posts SET texte = ? WHERE id = ?';
        const values = [data.texte, data.id];
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
    } else {
        const request = 'SELECT url_media FROM posts WHERE id = ?';
        const values = [data.id];
        db.query(
            request, values,
            function (err, results) {
                if (err) throw err;
                if (results[0] != undefined) {
                    const request2 = 'UPDATE posts SET texte = ?, url_media = ? WHERE id = ?';
                    const values2 = [data.texte, imageUrl, data.id];
                    const url2 = results[0].url_media;
                    db.query(
                        request2, values2,
                        function (err, results) {
                            if (err) throw err;
                            if (url2 != null) {
                                const filename = url2.split('/images/')[1];
                                fs.unlink(`images/${filename}`, (err) => {
                                    if (err) throw err;
                                    console.log("image supprimée avec succès")
                                })
                            }
                            res.json({
                                imageUrl,
                                status: 200,
                                message: "post modifié avec succès"
                            })
                        }
                    )

                }
            })
    }
};

// liste tous les likes/dislikes d'un utilisateur sur les posts
exports.getUserLikes = (req, res, next) => {
    const request = 'SELECT post_id, action FROM posts_likes WHERE user_id = ?';
    const values = [req.body.id];
    db.query(
        request, values,
        function (err, results) {
            if (err) throw err;
            res.json({
                results,
                status: 200,
                message: "liste des likes transmise avec succès"
            })
        })
};

// traitement des likes/dislikes :
// - si l'utilisateur like et qu'il n'a pas déjà liké alors création d'un like dans la table posts_likes et
//   incrémentaion du compteur de like de la table 'posts', même principe pour un dislike
// - si l'utilisateur like et qu'il avait disliké alors maj du like de la table posts_likes et
//   incrémentation du compteur de like + décrémentation compteur dislike, même principe pour un dislike
// - si l'utilisateur annule son like en cliquant à nouveau sur like alors suppression du like dans 'posts_likes'
//   et décrémentation compteur like dans 'posts' 
exports.likePost = (req, res, next) => {
    const request = 'SELECT * FROM posts_likes WHERE post_id = ? AND user_id = ?';
    const values = [req.body.pid, req.body.uid];
    db.query(
        request, values,
        function (err, results) {
            if (err) throw err;
            switch (req.body.act) {
                case 1:
                    if (results[0] === undefined) {
                        const request = 'INSERT INTO posts_likes VALUES (?,?,1)';
                        const values = [req.body.pid, req.body.uid];
                        db.query(
                            request, values,
                            function (err, results) {
                                if (err) throw err;
                                const request2 = 'UPDATE posts SET likes = likes + 1 WHERE id = ?';
                                const values2 = [req.body.pid];
                                db.query(
                                    request2, values2,
                                    function (err, results) {
                                        if (err) throw err;
                                        res.json({
                                            results,
                                            status: 200,
                                            message: "added like"
                                        })
                                    }
                                )

                            }
                        )
                    } else {
                        if (results[0].action === -1) {
                            const request = 'UPDATE posts_likes SET action = 1 WHERE post_id = ? AND user_id = ?';
                            const values = [req.body.pid, req.body.uid];
                            db.query(
                                request, values,
                                function (err, results) {
                                    if (err) throw err;
                                    const request2 = 'UPDATE posts SET likes = likes + 1, dislikes = dislikes - 1 WHERE id = ?';
                                    const values2 = [req.body.pid];
                                    db.query(
                                        request2, values2,
                                        function (err, results) {
                                            if (err) throw err;
                                            res.json({
                                                results,
                                                status: 200,
                                                message: "dislike -> like"
                                            })
                                        }
                                    )

                                }
                            )
                        }
                    }
                    break
                case -1:
                    if (results[0] === undefined) {
                        const request = 'INSERT INTO posts_likes VALUES (?,?,-1)';
                        const values = [req.body.pid, req.body.uid];
                        db.query(
                            request, values,
                            function (err, results) {
                                if (err) throw err;
                                const request2 = 'UPDATE posts SET dislikes = dislikes + 1 WHERE id = ?';
                                const values2 = [req.body.pid];
                                db.query(
                                    request2, values2,
                                    function (err, results) {
                                        if (err) throw err;
                                        res.json({
                                            results,
                                            status: 200,
                                            message: "added dislike"
                                        })
                                    }
                                )
                            }
                        )
                    } else {
                        if (results[0].action === 1) {
                            const request = 'UPDATE posts_likes SET action = -1 WHERE post_id = ? AND user_id = ?';
                            const values = [req.body.pid, req.body.uid];
                            db.query(
                                request, values,
                                function (err, results) {
                                    if (err) throw err;
                                    const request2 = 'UPDATE posts SET likes = likes - 1, dislikes = dislikes + 1 WHERE id = ?';
                                    const values2 = [req.body.pid];
                                    db.query(
                                        request2, values2,
                                        function (err, results) {
                                            if (err) throw err;
                                            res.json({
                                                results,
                                                status: 200,
                                                message: "like -> dislike"
                                            })
                                        }
                                    )
                                }
                            )
                        }
                    }
                    break
                case 0:
                    if (results[0] !== undefined) {
                        const request = 'DELETE FROM posts_likes WHERE post_id = ? AND user_id = ?';
                        const values = [req.body.pid, req.body.uid];
                        let column = "likes"
                        if (results[0].action === -1) { column = "dislikes" };
                        db.query(
                            request, values,
                            function (err, results) {
                                if (err) throw err;
                                const request2 = 'UPDATE posts SET ' + column + ' = ' + column + ' - 1 WHERE id = ?';
                                const values2 = [req.body.pid];
                                db.query(
                                    request2, values2,
                                    function (err, results) {
                                        if (err) throw err;
                                        res.json({
                                            results,
                                            status: 200,
                                            message: "like/dislike deleted"
                                        })
                                    }
                                )
                            }
                        )
                    }
                    break
                default:
                    res.json({
                        results,
                        status: 400,
                        message: "wrong like action value"
                    })
            }
        })
};