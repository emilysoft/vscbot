const connection = require("./connection.js");

const queries = [`USE vsc;`, `SELECT * FROM ignoredChannels;`];
queries.forEach((sql) => {
    connection.query(sql, (err, result) => {
        const data = Object.values(JSON.parse(JSON.stringify(result)));
        data.forEach(channel => console.log(channel.channelId))
    });
});

connection.end();
