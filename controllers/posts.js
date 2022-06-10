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

exports.getUserLikes = (req, res, next) => {
    const request = 'SELECT post_id, action FROM posts_likes WHERE user_id = ?';
    const values = [req.body.id];
    console.log("id : ", req.body.id);
    db.query(
        request, values,
        function (err, results) {
            if (err) throw err;
            console.log("results : ", results)
            res.json({
                results,
                status: 200,
                message: "liste des likes transmise avec succès"
            })
        })
};

exports.likePost = (req, res, next) => {
    const request = 'SELECT * FROM posts_likes WHERE post_id = ? AND user_id = ?';
    const values = [req.body.pid, req.body.uid];
    db.query(
        request, values,
        function (err, results) {
            if (err) throw err;
            console.log("back act : ", req.body.act)
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
                        console.log("results[0].action : ", results[0].action);
                        console.log("column : ", column);
                        db.query(
                            request, values,
                            function (err, results) {
                                if (err) throw err;
                                const request2 = 'UPDATE posts SET ' + column + ' = ' + column + ' - 1 WHERE id = ?';
                                const values2 = [req.body.pid];
                                console.log("back request 2 : ", request2);
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
            /*res.json({
                results,
                status: 200,
                message: "like traité"
            })*/
        })
};