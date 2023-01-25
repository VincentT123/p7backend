require('dotenv').config()

module.exports = {
  HOST: "db4free.net:3306",
  USER: "admingpm",
  PASSWORD: process.env.DB_PASS,
  DB: "groupomania"
};