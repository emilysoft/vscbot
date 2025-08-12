import { Message } from "discord.js"
import Client from "../interfaces/ICustomClient.js"

export default interface ICommand {
    name: string,
    vscOnly: boolean,
    ignoreBots: boolean,
    allowEdited: boolean,
    execute(message: Message, client: Client): Promise<void>
}