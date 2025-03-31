import config from "../config.json" with { type: "json" }
export default function (mensaje: string) {
    if (!config.LOGGER_STATUS) return
    if (mensaje == "") return
    console.log(mensaje);
}