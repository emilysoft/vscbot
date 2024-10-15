import vscLog from "../../loggers/automodLogger.js"
import Inmunidad from "../../../../settings/inmunidad.json" with {type:"json"}
import errorLogger from "../../loggers/errorLogger.js"
import isNumberInMessage from "./isNumberInMessage.js"
import { Message, TextChannel } from "discord.js";
import Client from "../../../classes/ICustomClient.js"
interface IInmunidad  {
        outOfContextRoleId: string,
        moderacionRoleId: string, 
        SilenciadoRoleId: string,
        mutedRoleId: string 
}
const inmunidad: IInmunidad = Inmunidad;

const module = async (message: Message, client:Client) => {
    if(message.channel instanceof TextChannel != true) return
    if (message.channel.parentId === "813564411628355625") return; //administracion
    if (message.channel.parentId === "1120080747668197436") return; // registro
    if (message.channel.parentId === "874730574089187359") return; //extralaborales


    if (isNumberInMessage(message)) {
        try {
            for (let inmune in inmunidad) {
                if(!message.member) return
                if (
                    message.member.roles.cache.some(
                        (role) => role.id === inmunidad[inmune as keyof IInmunidad]
                    )
                )
                    return;
            }
            message.delete();
            if(message.author.bot) return
            if(!message.guild) return
            if(!message.member) return
            const muted = message.guild.roles.cache.find(
                (role) => role.name === "Muted"
            );
            if (muted) {
                message.member.roles.add(muted, "Enviar un numero de teléfono");
            } else {
                message.member.timeout(6 * 24 * 60 * 60 * 1000, "Pasar un numero de telefono");
            }

            vscLog(
                message,
                client,
                "Número de teléfono",
                "ha sido muteado por enviar un posible numero de teléfono"
            );
        } catch (err) {
            errorLogger(err, client, "error", process.cwd() + " ");
        }
    }
};

export default module
