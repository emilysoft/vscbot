module.exports = (message) => {
  var args = message.content.substring(1).split(/ +/);
  message.channel.send(args.slice(1).join(" "));
  let regex = /(\d+){18,20}/gm;
  let regexReason = /\D+[a-zA-Z]+/gim;
  let matches = message.match(regex);
  matches.forEach((id) => {
    let user = message.guild.members.cache.find((u) => u.id == id);
    user.member.ban({ reason: reason });
  });
  console.log(matches); // ["fox", "friend", "fire"]
};
