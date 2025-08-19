import { Message } from "discord.js"
import Client from "../interfaces/ICustomClient.js"

export default interface IAutomod {
    name: string,
    exclusive: boolean,
    ignoreBots: boolean,
    allowEdited: boolean,
    execute(message: Message, client: Client): Promise<void>
}


