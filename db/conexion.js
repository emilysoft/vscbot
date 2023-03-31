//module.exports = ()=> {
const sqlite3 = require("sqlite3").verbose();
const databaseName = "data.db";
function connect() {
    let db = new sqlite3.Database(
        `./${databaseName}`,
        sqlite3.OPEN_READWRITE,
        (err) => {
            if (err) {
                console.error(err.message);
            } else {
                // console.log(`connected to the ${databaseName} database.`)
            }
        }
    );
    return db;
}
//}
const db = connect();
var sql1 = `CREATE TABLE users`
db.all(sql1, [], (err, rows) => {
    //error handle
    if (err) {
        throw err;
        console.error(err);
        return err;
    }


});
db.close();
