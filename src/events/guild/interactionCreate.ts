import { Events, Interaction } from 'discord.js'
import commandSlashLogger from '../../functions/loggers/commandSlashLogger.js'
import client from "../../index-vsc.js"
import IEvents from "../../interfaces/iEvents.js"
import {
  CUSTOM_ROLE_PANEL_BUTTON_ID,
  CUSTOM_ROLE_PANEL_MODAL_ID,
  handleCustomRolePanelButton,
  handleCustomRolePanelModal,
} from '../../functions/lib/customRolePanel.js'
const cooldowns = new Map<string, Map<string, number>>();
const module: IEvents = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        commandSlashLogger(interaction)
        const command = client.commands.get(interaction.commandName);

        if (!command) {
          console.error(`No command matching ${interaction.commandName} was found.`);
          return;
        }

        if (!command.execute) return

        if (command.cooldown) {
          if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Map<string, number>());
          }

          const now = Date.now();
          const timestamps = cooldowns.get(command.name)!;
          const cooldownAmount = command.cooldown * 1000;

          if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

            if (now < expirationTime) {
              const timeLeft = (expirationTime - now) / 1000;
              interaction.reply({ content: `Por favor, espera ${timeLeft.toFixed(1)} segundos antes de volver a usar \`${command.name}\`.`, ephemeral: true });
              return;
            }
          }

          timestamps.set(interaction.user.id, now);
          setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
          await command.execute(interaction, client);
        } else {
          await command.execute(interaction, client);
        }



      }
      else if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command?.autocomplete) return
        await command.autocomplete(interaction);
      }
      else if (
        interaction.isButton() &&
        interaction.customId === CUSTOM_ROLE_PANEL_BUTTON_ID
      ) {
        await handleCustomRolePanelButton(interaction);
      }
      else if (
        interaction.isModalSubmit() &&
        interaction.customId === CUSTOM_ROLE_PANEL_MODAL_ID
      ) {
        await handleCustomRolePanelModal(interaction);
      }
    }
    catch (error) {
      client.errorLogger(error, client, 'error')
      console.error("Error executing interaction");
      console.error(error);
    }

  }
}
export default module
