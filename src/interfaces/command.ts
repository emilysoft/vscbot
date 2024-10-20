import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Message,
    SharedSlashCommandOptions 
} 
from "discord.js"
import Client from "../classes/ICustomClient.js"
type TypeAfterAddingOptions = SharedSlashCommandOptions<TypeAfterAddingOptions>

export default interface ICommand {
    name: string
    description: string
    data: SlashCommandBuilder | SharedSlashCommandOptions<TypeAfterAddingOptions>  | SharedSlashCommandOptions<TypeAfterAddingOptions>
    slashCommand: boolean
    messageCommand: boolean
    execute?(interaction:ChatInputCommandInteraction, client:Client): Promise<void>
    run?(message:Message, client:Client, args?:string): Promise<void>
}