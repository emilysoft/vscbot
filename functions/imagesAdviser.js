// comprobar el mensaje con regex
// avisar si ya el author fue avisado
// si no fue avisado avisarle
//registrar el aviso
const message = {
    author : {
        id:  "212534615346151243",
        name: "tumadre"
    },
    content: "como paso imagenes",
};

const { author, content } = message;
const regex =
    /(pegan|pasar|enviar|manda(r|n))\s+([a-zA-Z]+\s+)?(gifs?|videos?|capturas?|im(a|á)genes|imagen|fotos?|fts|videos|m(e|o)m(o|e)s)/;

let db = connect();
if (content.match(regex)) {
const sql = `SELECT id FROM imageAdviser`
db.all(sql, [], (err, rows) => {
    if (err) throw err;
    rows.forEach((row) => console.log(row.fortuna));
});
}

db.close();
const sql = `SELECT * FROM fortunas;`;


function connect() {
    const sqlite3 = require("sqlite3").verbose();
    const databaseName = "data.db";
    let db = new sqlite3.Database(
        `./${databaseName}`,
        sqlite3.OPEN_READWRITE,
        (err) => {
            //if (err) console.error(err.message)
            console.log(`connected to the ${databaseName} database.`);
        }
    );
    return db;
}
