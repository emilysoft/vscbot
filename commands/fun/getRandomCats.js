const errorLogger = require("../../functions/loggers/errorLogger");
const cats = require("./cats.json");
module.exports = {
    name: "getRandomCats",
    description: "obtiene un gato random",
    async execute(message) {
        try {
            const cat = cats[Math.ceil(Math.random() * cats.length)];
            await message.channel.send({
                files: [cat],
            });
        } catch (err) {
            message.channel.send("Hubo un error.");
            errorLogger(err, message.client, "error");
        }
    },
};
