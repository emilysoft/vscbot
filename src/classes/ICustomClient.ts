import {Client, Collection} from "discord.js"
import ICustomClient from "../interfaces/ICustomClient.js"
import ICommand from "../interfaces/command.js"
export default class CustomClient extends Client implements ICustomClient {
    messageCommands: Collection<string, ICommand>
    commands: Collection<string, ICommand>
    iaUser: Collection<string, string>

    constructor() {
        super({ intents: [34571] })
        this.commands = new Collection()
        this.iaUser = new Collection()
        this.messageCommands = new Collection()
    }

}