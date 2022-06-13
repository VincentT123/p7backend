// routeur express definissant les routes à suivre pour chaque type de requête sur la table comments
// ainsi que les middleware à appliquer

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const commentsCtrl = require('../controllers/comments');

router.post('/listcomments', auth, commentsCtrl.getAllComments);
router.post('/createcomment', auth, commentsCtrl.createComment);
router.put('/updatecomment', auth, commentsCtrl.updateComment);
router.delete('/deletecomment', auth, commentsCtrl.deleteComment);


module.exports = router;