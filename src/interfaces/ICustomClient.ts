import {Client, Collection} from "discord.js"
import ICustomClient from "../interfaces/ICustomClient.js"
import ICommand from "../interfaces/command.js"
import Iautomod from "../interfaces/Iautomod.js"
import errorLoggerlib from "../functions/loggers/errorLogger.js"
import automodLoggerlib from "../functions/loggers/automodLogger.js"
export default class CustomClient extends Client implements ICustomClient {
    messageCommands: Collection<string, ICommand>
    commands: Collection<string, ICommand>
    iaUser: Collection<string, string>
    automod: Collection<string, Iautomod>
    errorLogger: Function 
    automodLogger: Function 

    constructor() {
        super({ intents: [34571] })
        this.commands = new Collection()
        this.iaUser = new Collection()
        this.messageCommands = new Collection()
        this.automod = new Collection()
        this.errorLogger = errorLoggerlib
        this.automodLogger = automodLoggerlib
    }

}