// package permettant les interactions avec la base de données
const mysql = require('mysql2');
const dbConfig = require('../config/dbConfig.js');

// les données de configuration de l'accès à la base Groupomania se trouvent dans le fichier config/dbConfig.js
const db = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
});

db.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + db.threadId);
});

global.db = db;

module.exports = db;