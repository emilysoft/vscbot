import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Message,
  SharedSlashCommandOptions,
  SlashCommandSubcommandsOnlyBuilder,
  AutocompleteInteraction
}
  from "discord.js"
import Client from "../interfaces/ICustomClient.js"
type TypeAfterAddingOptions = SharedSlashCommandOptions<TypeAfterAddingOptions>

export default interface ICommand {
  name: string
  description: string
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SharedSlashCommandOptions<TypeAfterAddingOptions> | SharedSlashCommandOptions<TypeAfterAddingOptions>
  cooldown: number,
  slashCommand: boolean,
  allowEdited: boolean,
  messageCommand: boolean,
  autocomplete?(interaction: AutocompleteInteraction): Promise<void>,
  execute?(interaction: ChatInputCommandInteraction, client: Client): Promise<void>,
  run?(message: Message, client: Client, args?: string): Promise<void>
}
