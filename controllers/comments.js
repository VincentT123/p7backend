// database parameters
const db = require('../db/db-groupomania');

// filesystem package
const fs = require('fs');

// récupère la liste des commentaires répondants à un post
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

// création d'un post avec si nécessaire l'adresse url de l'image associée
exports.createComment = (req, res, next) => {
  const data = JSON.parse(req.body.message);
  const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null;
  const request = 'INSERT INTO comments (date_cre, texte, post_id, user_id, user_name, url_media) VALUES (CURRENT_TIMESTAMP(),?,?,?,?,?)';
  const values = [data.texte, data.post_id, data.user_id, data.user_name, imageUrl];
  db.query(
    request, values,
    function (err, results) {
      if (err) throw err;
      const insertedId = results.insertId;
      const request2 = 'UPDATE posts SET comments = comments + 1 WHERE id = ?';
      const values2 = [data.post_id];
      db.query(
        request2, values2,
        function (err, results) {
          if (err) throw err;
          res.json({
            id: insertedId,
            status: 200,
            message: "comment créé avec succès"
          })
        })
    })
};

// suppression d'un post et suppression de l'image associée si elle existe
exports.deleteComment = (req, res, next) => {
  const request = 'SELECT url_media FROM comments WHERE id = ?';
  const values = [req.body.id];
  db.query(
    request, values,
    function (err, results) {
      if (err) throw err;
      if (results[0] != undefined) {
        const request2 = 'DELETE FROM comments WHERE id = ?';
        const values2 = [req.body.id];
        const url2 = results[0].url_media;
        db.query(
          request2, values2,
          function (err, results) {
            if (err) throw err;
            const request3 = 'UPDATE posts SET comments = comments - 1 WHERE id = ?';
            const values3 = [req.body.post_id];
            console.log("results deleteComment : ", results)
            db.query(
              request3, values3,
              function (err, results) {
                if (err) throw err;
                if (url2 != null) {
                  const filename = url2.split('/images/')[1];
                  console.log("filename delete : ", filename)
                  fs.unlink(`images/${filename}`, (err) => {
                    if (err) throw err;
                    console.log("image supprimée avec succès")
                  })
                }
                res.json({
                  results,
                  status: 200,
                  message: "comment supprimé avec succès"
                })
              })
          })
      }
    })
};

// mise à jour d'un post en séparant le traitement selon la présence ou non d'une image
// si l'image a été supprimée en front alors suppression de l'image du serveur
exports.updateComment = (req, res, next) => {
  const data = JSON.parse(req.body.message);
  const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null;
  if (imageUrl === null && data.supprImg === false) {
    const request = 'UPDATE comments SET texte = ? WHERE id = ?';
    const values = [data.texte, data.id];
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
  } else {
    const request = 'SELECT url_media FROM comments WHERE id = ?';
    const values = [data.id];
    db.query(
      request, values,
      function (err, results) {
        if (err) throw err;
        if (results[0] != undefined) {
          const request2 = 'UPDATE comments SET texte = ?, url_media = ? WHERE id = ?';
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
                message: "comment modifié avec succès"
              })
            }
          )
        }
      })
  }
};

// liste tous les likes/dislikes d'un utilisateur sur les commentaires
exports.getUserLikes = (req, res, next) => {
  const request = 'SELECT comment_id, action FROM comments_likes WHERE user_id = ?';
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
        message: "liste des likes comments transmise avec succès"
      })
    })
};

// traitement des likes/dislikes :
// - si l'utilisateur like et qu'il n'a pas déjà liké alors création d'un like dans la table comments_likes et
//   incrémentaion du compteur de like de la table 'comments', même principe pour un dislike
// - si l'utilisateur like et qu'il avait disliké alors maj du like de la table comments_likes et
//   incrémentation du compteur de like + décrémentation compteur dislike, même principe pour un dislike
// - si l'utilisateur annule son like en cliquant à nouveau sur like alors suppression du like dans 'comments_likes'
//   et décrémentation compteur like dans 'comments' 
exports.likeComment = (req, res, next) => {
  const request = 'SELECT * FROM comments_likes WHERE comment_id = ? AND user_id = ?';
  const values = [req.body.cid, req.body.uid];
  db.query(
    request, values,
    function (err, results) {
      if (err) throw err;
      console.log("back act : ", req.body.act)
      switch (req.body.act) {
        case 1:
          if (results[0] === undefined) {
            const request = 'INSERT INTO comments_likes VALUES (?,?,1)';
            const values = [req.body.cid, req.body.uid];
            db.query(
              request, values,
              function (err, results) {
                if (err) throw err;
                const request2 = 'UPDATE comments SET likes = likes + 1 WHERE id = ?';
                const values2 = [req.body.cid];
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
              const request = 'UPDATE comments_likes SET action = 1 WHERE comment_id = ? AND user_id = ?';
              const values = [req.body.cid, req.body.uid];
              db.query(
                request, values,
                function (err, results) {
                  if (err) throw err;
                  const request2 = 'UPDATE comments SET likes = likes + 1, dislikes = dislikes - 1 WHERE id = ?';
                  const values2 = [req.body.cid];
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
            const request = 'INSERT INTO comments_likes VALUES (?,?,-1)';
            const values = [req.body.cid, req.body.uid];
            db.query(
              request, values,
              function (err, results) {
                if (err) throw err;
                const request2 = 'UPDATE comments SET dislikes = dislikes + 1 WHERE id = ?';
                const values2 = [req.body.cid];
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
              const request = 'UPDATE comments_likes SET action = -1 WHERE comment_id = ? AND user_id = ?';
              const values = [req.body.cid, req.body.uid];
              db.query(
                request, values,
                function (err, results) {
                  if (err) throw err;
                  const request2 = 'UPDATE comments SET likes = likes - 1, dislikes = dislikes + 1 WHERE id = ?';
                  const values2 = [req.body.cid];
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
            const request = 'DELETE FROM comments_likes WHERE comment_id = ? AND user_id = ?';
            const values = [req.body.cid, req.body.uid];
            let column = "likes"
            if (results[0].action === -1) { column = "dislikes" };
            console.log("results[0].action : ", results[0].action);
            console.log("column : ", column);
            db.query(
              request, values,
              function (err, results) {
                if (err) throw err;
                const request2 = 'UPDATE comments SET ' + column + ' = ' + column + ' - 1 WHERE id = ?';
                const values2 = [req.body.cid];
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