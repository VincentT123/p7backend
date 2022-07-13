// routeur express definissant les routes à suivre pour chaque type de requête sur la table 'posts'
// ainsi que les middleware à appliquer

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const postsCtrl = require('../controllers/posts');

router.post('/like', auth, postsCtrl.likePost);
router.post('/userlikes', auth, postsCtrl.getUserLikes);
router.get('/listposts', auth, postsCtrl.getAllPosts);
router.post('/createpost', auth, multer, postsCtrl.createPost);
router.put('/updatepost', auth, multer, postsCtrl.updatePost);
router.delete('/deletepost', auth, postsCtrl.deletePost);

module.exports = router;