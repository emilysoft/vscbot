const connection = require("./connection.js");

const sql = `SELECT * FROM ignoredChannels;`;
connection.query(sql, (err, result) => {
    const data = Object.values(JSON.parse(JSON.stringify(result)));
    data.forEach((channel) => console.log(channel.channelId));
});

connection.end();
