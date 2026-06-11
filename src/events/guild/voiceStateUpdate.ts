import { Events, VoiceState } from "discord.js";
import IEvents from "../../interfaces/iEvents.js";
import Client from "../../interfaces/ICustomClient.js";
import { handleVoiceJoin, handleVoiceLeave } from "../../functions/scheduledEvents/eventManager.js";

const module: IEvents = {
  name: Events.VoiceStateUpdate,
  async execute(oldState: VoiceState, newState: VoiceState) {
    try {
      const client = newState.client as Client;

      if (oldState.channelId && oldState.channelId !== newState.channelId) {
        await handleVoiceLeave(client, oldState.guild.id, oldState.id, oldState.channelId);
      }

      if (newState.channelId && oldState.channelId !== newState.channelId) {
        await handleVoiceJoin(client, newState.guild.id, newState.id, newState.channelId);
      }
    } catch (err) {
      (newState.client as Client).errorLogger(err, newState.client, "error", `${process.cwd()} events/voiceStateUpdate`);
    }
  },
};

export default module;
