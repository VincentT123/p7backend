require('dotenv').config()

module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: process.env.DB_PASS,
  DB: "groupomania"
};