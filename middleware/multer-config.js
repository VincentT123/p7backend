// le package multer permet de gérer les fichiers entrants dans les requêtes http, ici des fichiers images
const multer = require('multer');

const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif'
};

// configuration du chemin et du nom sous lequel le fichier image sera stocké
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    //const name = file.originalname.split(' ').join('_');
    const name = path.parse(file.originalname).name.split(' ').join('_');
    console.log("originalname : ", file.originalname);
    console.log("name : ", name);
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({ storage: storage }).single('image');