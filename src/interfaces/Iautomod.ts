import {Message} from "discord.js"
import Client from "../interfaces/ICustomClient.js"

export default interface ICommand {
    name: string,
    ignoreBots: boolean,
    execute(message:Message, client:Client): Promise<void>
}