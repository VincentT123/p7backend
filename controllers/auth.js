// le package bcrypt permet le chiffrement et le hashage des mots de passe à stocker dans la base de données
// le package jsonwebtoken permet de créer et de vérifier des tokens d'authentification afin qu'un utilisateur
// n'utilise qu'une seule session de connexion et soit authentifié pour chacune de ses requêtes durant cette
// session
const db = require('../db/db-groupomania');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config()

// fonction utilisée pour la requête d'inscription d'un utilisateur
exports.signup = async (req, res) => {
  const ruleMail = /^[a-z0-9._-]{2,30}[@][a-z0-9_-]{2,20}[.][a-z]{2,15}$/;
  const rulePass = /^[A-Za-z0-9-*+]{8,25}$/;
  if (ruleMail.test(req.body.email) && (rulePass.test(req.body.password))) {
    bcrypt
      .hash(req.body.password, 10)
      .then(hash => {
        const nom = req.body.nom;
        const prenom = req.body.prenom;
        const email = req.body.email;
        const password = hash;
        const picture = req.body.picture;
        const sql = "INSERT INTO users (nom, prenom, email, password, picture) VALUES " +
          "('" + nom + "', '" + prenom + "', '" + email + "', '" + password + "', '" + picture + "')";
        db.query(sql, (err, result) => {
          if (err) throw err;
          if (!result) {
            res.json({
              result,
              status: 200,
              message: "email déjà enregistré !"
            })
          } else {
            res.json({
              result,
              status: 201,
              message: "utilisateur créé !"
            })
          }
        });
      })
      .catch(error => res.status(500).json({ error }));
  } else {
    if (rulePass.test(req.body.password)) {
      return res.status(401).json({ error: 'Email incorrect !' });
    } else {
      return res.status(401).json({ error: 'Password incorrect !' });
    }
  };
};

// fonction utilisée pour la requête de connexion d'un utilisateur
exports.login = (req, res) => {
  const ruleMail = /^[a-z0-9._-]{2,30}[@][a-z0-9_-]{2,20}[.][a-z]{2,15}$/;
  const rulePass = /^[A-Za-z0-9-*+]{8,25}$/;
  if (ruleMail.test(req.body.email) && (rulePass.test(req.body.password))) {
    const sql = "SELECT id, nom, prenom, email, password, picture FROM users WHERE email='" + req.body.email + "'"
    db.query(sql, async (err, results) => {
      if (err) throw err;
      if (results[0] === undefined) {
        res.json({
          results,
          status: 404,
          message: "email inconnu !"
        })
      } else {
        bcrypt.compare(req.body.password, results[0].password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            res.status(200).json({
              userId: results[0].id,
              token: jwt.sign(
                { userId: results[0].id },
                process.env.TOKEN,
                { expiresIn: "24h" }
              ),
              nom: results[0].nom,
              prenom: results[0].prenom
            });
          })
          .catch(error => res.status(500).json({ error }));
      }
    })
  } else {
    if (rulePass.test(req.body.password)) {
      return res.status(401).json({ error: 'Email incorrect !' });
    } else {
      return res.status(401).json({ error: 'Password incorrect !' });
    }
  };
};
