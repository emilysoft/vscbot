const mysql = require("mysql");
module.exports = mysql.createConnection({
    database: "vsc",
    host: "localhost",
    user: "root",
    password: "123",
});
