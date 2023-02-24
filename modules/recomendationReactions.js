module.exports = (message, targetChannel) => {
  if (message.channelId != targetChannel) return;
  if (message.channel.isThread()) return;
  message.react("👍").catch((error) => {
    console.error(error);
  });
  message.react("👎").catch((error) => {
    console.error(error);
  });
};
