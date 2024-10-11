import errorLogger from "../functions/loggers/errorLogger.js"
const canal_inactivos = "1272621881543102567";
const canal_noVerificados = "1142222030377328750";
const inactivo = "<@&1272564404193460286>";
const noVerificado = "<@&1260331890406068325>";
const module = async (now, client) => {
    try {
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const channel = client.channels.cache.find(
            (c) => c.id === canal_inactivos
        );
        const channel2 = client.channels.cache.find(
            (c) => c.id === canal_noVerificados
        );

        if (hour == 8 && minutes == 0) {
            channel
                .send(inactivo + " Ups, parece que te has quedado dormido/a")
                .then((msg) => msg.delete());
            channel2
                .send(
                    noVerificado +
                        " No olvides verificar tu cuenta para entrar al servidor"
                )
                .then((msg) => msg.delete());
        }
    } catch (err) {
        errorLogger(err, message.client, "error");
    }
};
export default module 
