require('dotenv').config()

module.exports = {
  HOST: "db4free.net",
  USER: "admingpm",
  PASSWORD: process.env.DB_PASS,
  DB: "groupomania"
};