const notifier = require("node-notifier");
const path = require("path");
const antiCrypto = require("./modules/antiCrypto");
const addColors = require("./modules/addColor");
const fuckf = require("./modules/fuck");
const nsfwbot = require("./modules/nsfwbot");
const addRoles = require("./modules/addRoles");
const bcv = require("./modules/bcv");
const neetAdviser = require("./modules/neetAdviser");
const timer = require("./modules/timer");
const {
  token,
  prefix,
  ignoredChannels,
  backupChannel,
} = require("./config.json");
const welcome = require("./modules/welcome");
const bcvUpdate = require("./modules/bcvUpdate");
const lockChannel = require("./modules/lockChannel");
const staffSleeping = require("./modules/staffSleeping");
const bancsv = require("./modules/bancsv");
const { Client, GatewayIntentBits } = require("discord.js");
const clearRoles = require("./modules/clearRoles");
const help = require("./modules/help");
//const despedidas = require('./modules/despedidas');
const banDIscordInvite = require("./modules/banDIscordInvite");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

/**
 *GUILD_MESSAGE_REACTIONS
 * **/
//  noMoreImages = require('./modules/noMoreImages'),
(neet = "302249242469335060"),
  (banner = require("./modules/banner")),
  (globo = require("./modules/globo")),
  (antiWalltexts = require("./modules/walltext")),
  (nickNameChanger = require("./modules/nickNameChanger")),
  (ignoreChannel = require("./modules/ignoreChannel")),
  (OnInviteIsCreate = require("./modules/OnInviteIsCreate")),
  (bannedlist = require("./modules/bannedlist")),
  ({
    SEND_MESSAGES,
    ATTACH_FILES,
    EMBED_LINKS,
  } = require("./modules/permissions")),
  (recomendationReactions = require("./modules/recomendationReactions")),
  (bumpReminder = require("./modules/bumpReminder")),
  (bumpChannelId = "813796911994896397");
var today;
var hoy;
client.on("ready", () => {
  //  bancsv(client)
  //clearRoles(client)
  setInterval(() => {
    hoy = new Date();
    staffSleeping(hoy, client);
    timer(hoy, client);
    bcvUpdate(hoy, client);
    lockChannel(hoy, client);
    // mcStatus(client, "1010373885012758639", "1018439024530182214");
  }, 60000);

  console.log("Bot corriendo");
  notifier.notify({
    message: "vsc-bot iniciado",
    icon: path.join(__dirname, "logo.png"),
    wait: true,
  });

  client.user.setPresence({
    activities: [{ name: `Valorant` }],
    status: "online",
  });
  setTimeout(() => {
    client.user.setPresence({
      activities: [{ name: `Valorant` }],
      status: "online",
    });
  }, 300000);
});
//client.on("guildMemberRemove", async member => {
//  despedidas(member, client)
//})
client.on("messageReactionAdd", async (messageReaction, user) => {
  // if(messageReaction.channel.id == "1017765691115446363") return // server-log
  // if(messageReaction.channel.id == "1036627246657577041") return // consola
  // if(messageReaction.channel.id == "1036627246657577041") return // consola
  // if(messageReaction.channel.id == "821067797157118013") return // mudae
  today = new Date();
  console.log(
    `[${today.getDate()}/${
      today.getMonth() + 1
    }/${today.getFullYear()}][${today.getHours()}:${today.getMinutes()}][${
      user.id
    }][][${messageReaction.emoji}] fue agregado por ${user.username}`
  );
});
//client.on("messageReactionRemoveAll", async (message, messageReaction) => {
//  today = new Date();
//  console.log(`[${today.getDate()}/${(today.getMonth()+1)}/${today.getFullYear()}][${today.getHours()}:${today.getMinutes()}][${user.id}][message.channel.name] ${user.username}: ${message.author.id}][${message.channel.name}] reacciones de ${message.author.username} fueron borrados`)
//})
client.on("messageReactionRemove", async (messageReaction, user) => {
  //  if(messageReaction.channel.id == "1017765691115446363") return // server-log
  //  if(messageReaction.channel.id == "1036627246657577041") return // consola
  //  if(messageReaction.channel.id == "1036627246657577041") return // consola
  //  if(messageReaction.channel.id == "821067797157118013") return // mudae
  today = new Date();
  console.log(
    `[${today.getDate()}/${
      today.getMonth() + 1
    }/${today.getFullYear()}][${today.getHours()}:${today.getMinutes()}][${
      user.id
    }][${messageReaction.message.channel.name}][${
      messageReaction.emoji
    }] removido por ${user.username}`
  );
});
client.on("messageDelete", async (message) => {});
client.on("messageCreate", async (message) => {
  if (message.channel.id == "1017765691115446363") return; // server-log
  if (message.channel.id == "1036627246657577041") return; // consola
  if (message.channel.id == "821067797157118013") return; // mudae
  banDIscordInvite(message, client);
  antiWalltexts(message, client, ignoredChannels, backupChannel);
  antiCrypto(message, client);
  //  noArab(message)
  //  noMoreImages(message, client, "813538324320092164");
  //callate(message)
  today = new Date();
  console.log(
    `[${today.getDate()}/${
      today.getMonth() + 1
    }/${today.getFullYear()}][${today.getHours()}:${today.getMinutes()}][${
      message.author.id
    }][${message.channel.name}] ${message.author.username}: ${message.content}`
  );

  if (message.author.id == "282286160494067712") {
    bcv(message, false);
  }
  if (message.content.startsWith(prefix)) {
    if (message.content.startsWith(">ban") && message.author.id == neet) {
    }
    if (message.content.startsWith(">bcv")) {
      bcv(message, true);
    }
    if (message.content.startsWith(">color") && message.author.id == neet) {
      addColors(message);
    }
    if (message.content.startsWith(">help")) {
      help(message, client);
    }
    if (message.content.startsWith(">nick") && message.author.id == neet) {
      fuckf(message);
    }
    if (
      message.content.startsWith(">spookytime") &&
      message.author.id == neet
    ) {
      nickNameChanger(message);
    }
    if (message.content.startsWith(">nsfw") && message.author.id == neet) {
      nsfw.forEach((e) => {
        message.channel.send(e);
      });
    }
    if (message.content.startsWith(">save") && message.author.id == neet) {
      message.channel.send("<:gawr_hola:918317399755874314>");
    }

    if (message.content.startsWith(">unignore")) {
      console.log("ejecutando unignore");
      if (
        message.member.roles.cache.some(
          (role) => role.id === "844230283737038848"
        )
      )
        ignoreChannel(message, client, "unignore");
    }

    if (message.content.startsWith(">ignore")) {
      console.log("ejecutando ignore ");
      if (
        message.memer.roles.cache.some(
          (role) => role.id === "844230283737038848"
        )
      )
        ignoreChannel(message, client, "ignore");
    }
    if (message.content.startsWith(">channels")) {
      console.log("ejecutando channels ");
      if (
        message.member.roles.cache.some(
          (role) => role.id === "844230283737038848"
        )
      )
        ignoreChannel(message, client, "channels");
    }

    if (message.content.startsWith(">banner")) {
      banner(message);
    }
    if (message.content.startsWith(">afk")) {
      message.channel.send(`<@${message.author.id}> se fue pal' coño`);
    }
    if (message.content.startsWith(">wallpaper") && message.author.id == neet) {
      wallpaper(message, client);
    }
    if (message.content.startsWith(">gb")) {
      globo(message, "./media");
    }
    if (
      message.content.startsWith(">bannedlist") &&
      message.author.id == neet
    ) {
      bannedlist(message);
    }
    if (message.content.startsWith(">lock")) {
      let moderacionRoleId = "813568302294761486";
      if (
        message.member.roles.cache.some((role) => role.id === moderacionRoleId)
      )
        message.channel.send(
          "Canal bloqueado hasta que se me canten los huevos"
        );
    }
    if (message.content.startsWith(">say") && message.author.id == neet) {
      message.delete().catch((error) => {
        if (error.code !== 10008)
          console.error("Failed to delete the message:", error);
      });
      var args = message.content.substring(1).split(/ +/);
      message.channel.send(args.slice(1).join(" "));
    }
  }
  if (message.content.startsWith("!suckmode")) {
    message.channel.send("suckmode de 5 segundos activado en el canal");
  }
  if (message.content.startsWith(">suckmode")) {
    message.channel.send("suckmode de 5 segundos activado en el canal");
  }
  welcome(message);
  bumpReminder(message, bumpChannelId);
  recomendationReactions(message, "813553405695361105");
  recomendationReactions(message, "1010377354020929536");
  recomendationReactions(message, "1013280756757430364");
  recomendationReactions(message, "942934915396288542");
  //  neetAdviser(message);
  nsfwbot(message);
});

client.on("messageUpdate", async (oldM, newM) => {
  antiWalltexts(newM, client, ignoredChannels, backupChannel);
});

client.on("inviteCreate", async (invite) => {
  OnInviteIsCreate(client, invite);
});

client.login(token);
