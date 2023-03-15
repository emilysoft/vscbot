const {
  PermissionsBitField,
  ApplicationCommandOptionWithChoicesAndAutocompleteMixin,
} = require("discord.js");
const permisosDenegados = {
  SendMessages: false,
  ViewChannel: false,
};
const permisosPermitidos = {
  //  UseApplicationCommands: true
  SendMessages: true,
  ViewChannel: true,
};
const channels = [
  "813538324320092164",
  "937087166645960714",
  "1005354020333948988",
  "853387980335874078",
  "813562627481010196",
  "813562627481010196",
  "813553355783405598",
  "1018612558061649940",
  "879524287629914153",
  "813553343233523712",
  "813796911994896397",
  "879519683961835571",
  "836224794206404629",
  "836012533961850950",
  "836012454961217556",
  "821081995169759274",
  "879519706560725002",
  "836012275894452234",
  "1020517264858034196",
  "1010296278040719380",
  "1018300429899145236",
  "1010373278336032778",
  "908127146625609759",
  "908132414159732748",
  "908132493113315359",
  "813562545419845632",
  "815031494359253002",
  "1014933451121627249",
  "821067797157118013",
  "876095489148325889",
  "813564359874838558",
  "1052733551893827644",
  "1053118780705874040",
  "836362584088903710",
  "860281281811709953",
  "813553405695361105",
  "813564908263571456",
  "875589565514145803",
  "948782010955104376",
  "1058586276854517873",
  "874447972425941032",
  "1007457166342488176",
];
const guildId = "813538324320092161";

module.exports = async (client) => {
  let guild = await client.guilds.cache.get(guildId);
  let role = guild.roles.cache.find((c) => c.id === "813541495968759822");
  try {
    //        await guild.channels.cache.find(channel => {
    channels.forEach((channelId) => {
      let channel = guild.channels.cache.find((c) => c.id === channelId);
      if (channel.isTextBased()) {
        //                    roles.forEach(role => {
        channel.permissionOverwrites
          .create(role, permisosPermitidos)
          .then(() => console.log(`permisos de ${channel.name} permitidos`))
          .catch((error) => console.error(error));
        //                    })
      }
      //            })
    });
  } catch (err) {
    console.log(err);
  }
};
