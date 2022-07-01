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
      console.log("results create comment : ", results);
      const insertedId = results.insertId;
      console.log("insertedId : ", insertedId);
      const request2 = 'UPDATE posts SET comments = comments + 1 WHERE id = ?';
      const values2 = [req.body.post_id];
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

exports.deleteComment = (req, res, next) => {
  const request = 'DELETE FROM comments WHERE id = ?';
  const values = [req.body.id];
  db.query(
    request, values,
    function (err, results) {
      if (err) throw err;
      const request2 = 'UPDATE posts SET comments = comments - 1 WHERE id = ?';
      const values2 = [req.body.post_id];
      console.log("results deleteComment : ", results)
      db.query(
        request2, values2,
        function (err, results) {
          if (err) throw err;
          res.json({
            results,
            status: 200,
            message: "comment supprimé avec succès"
          })
        })
    })
};

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