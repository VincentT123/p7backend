require('dotenv').config()

module.exports = {
  HOST: "localhost",
  USER: "admingpm",
  PASSWORD: process.env.DB_PASS,
  DB: "groupomania"
};