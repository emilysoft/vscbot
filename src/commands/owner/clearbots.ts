import config from "../../config.json" with {type: "json"}
import { Message, SlashCommandBuilder } from "discord.js"
import Client from "../../interfaces/ICustomClient.js"
import ICommand from "../../interfaces/command.js"
import { clearBots } from "../../functions/automod/workers/clearChat.js"
const module: ICommand = {
    name: "clearbots",
    description: "borrar todos los bots",
    slashCommand: false,
    cooldown: 1,
    messageCommand: true,
    allowEdited: false,
    data: new SlashCommandBuilder()
        .setName("clearbots")
        .setDescription("borras todos los bots"),
    async run(message: Message, client: Client) {
        if (config.OWNERS_ID[0] == message.author.id || message.member?.roles.cache.has("813979041027457044")) {
            await message.delete()
            clearBots(message)
        }
    },
};

export default module
