// database parameters
const db = require('../db/db-groupomania');

// filesystem package
const fs = require('fs');

exports.getAllComments = (req, res, next) => {
  const request = 'SELECT * FROM comments WHERE post_id = ? ORDER BY date_cre ASC';
  const values = [req.body.post_id];
  console.log("back post_id : ", req.body.post_id);
  db.query(
    request, values,
    function (err, results) {
      if (err) throw err;
      console.log("results : ", results)
      res.json({
        results,
        status: 200,
        message: "liste des comments transmise avec succès"
      })
    })
};

exports.createComment = (req, res, next) => {
  const request = 'INSERT INTO comments (date_cre, texte, post_id, user_id, user_name) VALUES (CURRENT_TIMESTAMP(),?,?,?,?)';
  const values = [req.body.texte, req.body.post_id, req.body.user_id, req.body.user_name];
  db.query(
    request, values,
    function (err, results) {
      if (err) throw err;
      res.json({
        results,
        status: 200,
        message: "comment créé avec succès"
      })
    })
};

exports.deleteComment = (req, res, next) => {
  const request = 'DELETE FROM comments WHERE id = ?';
  const values = [req.body.id];
  db.query(
    request, values,
    function (err, results) {
      if (err) throw err;
      res.json({
        results,
        status: 200,
        message: "comment supprimé avec succès"
      })
    })
};

exports.updateComment = (req, res, next) => {
  const request = 'UPDATE comments SET texte = ? WHERE id = ?';
  const values = [req.body.texte, req.body.id];
  db.query(
    request, values,
    function (err, results) {
      if (err) throw err;
      res.json({
        results,
        status: 200,
        message: "comment modifié avec succès"
      })
    })
};