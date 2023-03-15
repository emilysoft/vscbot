module.exports = (message) => {
  if (message.channel.id != "1024260771326197781") return;
  regex =
    /(\si|i)('ll|\swill)\s(help|teach)\s(the first|\w+)\s?((\S+\W+\D+)(\d{1,2}k|\$))/gim;
  if (message.content.match(regex) != null)
    message.delete().catch((error) => {
      if (error.code !== 10008)
        console.error("Failed to delete the message in :", error);
    });
};
