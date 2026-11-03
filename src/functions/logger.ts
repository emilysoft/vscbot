import config from "../config/config.json" with { type: "json" }
export default function(mensaje: string) {
  if (!config.loggerStatus) return
  if (mensaje == "") return
  console.log(mensaje);
}
