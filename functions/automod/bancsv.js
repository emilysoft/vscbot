const fs = require("fs");
let razon = "";
module.exports = async (client) => {
  try {
    const neetoons = await client.guilds.cache.find(
      (g) => g.id === "813538324320092161"
    );
    fs.writeFile(
      "baneados.csv",
      "id,Nombre de Usuario,razón",
      { flag: "a+" },
      (err) => {
        if (err) console.error(err);
      }
    );
    neetoons.bans.fetch().then((banned) => {
      banned.map((ban) => {
        razon = `${ban.user.id},${ban.user.username},${ban.reason}`;
        fs.writeFile("baneados.csv", razon + "\n", { flag: "a+" }, (err) => {
          if (err) console.error(err);
        });
      });
    });
  } catch (e) {
    console.log(e);
  }
};
