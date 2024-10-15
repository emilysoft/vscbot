import { Collection} from "discord.js"
import ICommand from "../interfaces/command.js"
export default interface ICustomClient {
    commands: Collection<string, ICommand>
    messageCommands: Collection<string, ICommand>
    iaUser:Collection<string, string>;

}