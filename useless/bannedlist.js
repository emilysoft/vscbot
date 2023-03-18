module.exports = (message) => {
  message.guild.bans
    .fetch()
    .then((banned) => {
      banned.map((ban) => console.log(ban.user.id));
    })
    .catch(console.error);
};
