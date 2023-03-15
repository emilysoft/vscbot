const fs = require("fs");
const Path = require("path");
const Axios = require("axios");

module.exports = async function (url, name) {
    console.log("descargando");
    //para descargar imagenes
    const path = Path.resolve(__dirname, './media/attachment/', `${name}.png`);
    const writer = fs.createWriteStream(path);

    const response = await Axios({
        url,
        method: "GET",
        responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
};
