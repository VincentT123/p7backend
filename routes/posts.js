// routeur express definissant les routes à suivre pour chaque type de requête sur la table posts
// ainsi que les middleware à appliquer

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const postsCtrl = require('../controllers/posts');

/*router.post('/:id/like', auth, postsCtrl.likePost);
router.post('/', auth, multer, postsCtrl.createPost);
router.put('/:id', auth, multer, postsCtrl.modifyPost);
router.delete('/:id', auth, postsCtrl.deletePost);
router.get('/:id', auth, postsCtrl.getOnePost);
router.get('/', auth, postsCtrl.getAllPosts);*/
router.post('/like', auth, postsCtrl.likePost);
router.post('/userlikes', auth, postsCtrl.getUserLikes);
router.get('/listposts', auth, postsCtrl.getAllPosts);
router.post('/createpost', auth, multer, postsCtrl.createPost);
router.put('/updatepost', auth, postsCtrl.updatePost);
router.delete('/deletepost', auth, postsCtrl.deletePost);

module.exports = router;