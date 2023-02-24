/**
 1.- Guardar todos los nicknames junto a sus id de los presentes y nuevos usuarios, si este no tiene nickname, guardar el username.
 2.- Colocar apodo con username + calabaza, si este tiene username seria username + calabaza, en caso de que no quepa se ignorara 
 3.- Cargar desde la base de datos los y id y sus nombres
 */
const mysql = require("mysql");
const config = require("./database2");
module.exports = (usuario) => {
  let connection = mysql.createConnection(config);
  connection.connect((err) => {
    if (err) {
      return console.error(`error: ${err.message}`);
    }
    console.log("Connected to the MySQL server.");
  });

  if (usuario.user.bot) return;
  let sql = `INSERT INTO users (id, usernames) VALUES("${usuario.user.id}", "${usuario.user.username}")`;
  connection.query(sql, (error) => {
    if (error) return console.error(error);
  });

  connection.end(function (err) {
    if (err) return console.log("error:" + err.message);
    console.log("Close the database connection.");
  });
};
