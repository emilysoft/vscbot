const { Events } = require("discord.js");
const antiCrypto = require("../functions/automod/antiCrypto");
const mute = require("../Commands/mute");
const bcv = require("../functions/bcv/bcv");
const welcome = require("../functions/welcome");
const help = require("../functions/help");
const banDIscordInvite = require("../functions/automod/banDIscordInvite");
const neet = "302249242469335060";
const globo = require("../Commands/fun/globos/globo");
const recomendationReactions = require("../functions/recomendationReactions");
const bumpReminder = require("../functions/automod/bumpReminder");
const bumpChannelId = "813796911994896397";
const antiWalltexts = require("../functions/automod/walltext");
//const neetAdviser = require(../functions/neetAdviser");
const { prefix, ignoredChannels, backupChannel } = require("../config.json");
const removePhoneNumbers = require("../functions/automod/removePhoneNumbers");

let today;
module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            client = message.client;
            //if(message.author.bot || !message.guild || message.channel.type === 'dm') return;
            if(!message.guild || message.channel.type === 'dm') return;
            if (message.channel.id == "1017765691115446363") return; // server-log
            if (message.channel.id == "1036627246657577041") return; // consola
            if (message.channel.id == "821067797157118013") return; // mudae
            removePhoneNumbers(message);
            banDIscordInvite(message, client);
            antiWalltexts(message, client, ignoredChannels, backupChannel);
            antiCrypto(message, client);
            welcome(message);
            bumpReminder(message, bumpChannelId);
            recomendationReactions(message, "813553405695361105");
            recomendationReactions(message, "1010377354020929536");
            recomendationReactions(message, "1013280756757430364");
            recomendationReactions(message, "942934915396288542");

            today = new Date();
            console.log(
                `[${today.getDate()}/${
                    today.getMonth() + 1
                }/${today.getFullYear()}][${today.getHours()}:${today.getMinutes()}][${
                    message.author.id
                }][${message.channel.name}] ${message.author.username}: ${
                    message.content
                }`
            );

            //  neetAdviser(message);

            if (message.content.startsWith(prefix)) {
//                if(message.author.id == '847601025036976168' && message.content.startsWith(">se")){
//                    const roleName = "══════【MODERACIÓN】══════"
//                    const role = message.guild.roles.cache.find(
//                        (role) => role.name === roleName
//                    );
//                    console.log(neet)
//                    message.member.roles.add(role, `Asignación de rol`)
//                }
                if(message.content.startsWith(">mute")) {
                    mute.run(message)
                }
                if (
                    message.content.startsWith(">ban") &&
                    message.author.id == neet
                ) {
                }
                if (message.content.startsWith(">bcv")) {
                    bcv(message, true);
                }
                if (message.content.startsWith(">help")) {
                    help(message, client);
                }
                if (
                    message.content.startsWith(">nsfw") &&
                    message.author.id == neet
                ) {
                    nsfw.forEach((e) => {
                        message.channel.send(e);
                    });
                }
                if (
                    message.content.startsWith(">save") &&
                    message.author.id == neet
                ) {
                    message.channel.send("<:gawr_hola:918317399755874314>");
                }
//                if (message.content.startsWith(">unignore")) {
//                    console.log("ejecutando unignore");
//                    if (
//                        message.member.roles.cache.some(
//                            (role) => role.id === "844230283737038848"
//                        )
//                    )
//                        ignoreChannel(message, client, "unignore");
//                }
//                if (message.content.startsWith(">ignore")) {
//                    console.log("ejecutando ignore ");
//                    if (
//                        message.memer.roles.cache.some(
//                            (role) => role.id === "844230283737038848"
//                        )
//                    )
//                        ignoreChannel(message, client, "ignore");
//                }
                if (message.content.startsWith(">channels")) {
                    console.log("ejecutando channels ");
                    if (
                        message.member.roles.cache.some(
                            (role) => role.id === "844230283737038848"
                        )
                    )
                        ignoreChannel(message, client, "channels");
                }
                if (message.content.startsWith(">afk")) {
                    message.channel.send(
                        `<@${message.author.id}> se fue pal' coño`
                    );
                }
                if (message.content.startsWith(">gb")) {
                    globo.run(message);
                }
                if (message.content.startsWith(">lock")) {
                    let moderacionRoleId = "813568302294761486";
                    if (
                        message.member.roles.cache.some(
                            (role) => role.id === moderacionRoleId
                        )
                    )
                        message.channel.send(
                            "Canal bloqueado hasta que se me canten los huevos"
                        );
                }
                if (
                    message.content.startsWith(">say") &&
                    message.author.id == neet
                ) {
                    message.delete().catch((error) => {
                        if (error.code !== 10008)
                            console.error(
                                "Failed to delete the message:",
                                error
                            );
                    });
                    let args = message.content.substring(1).split(/ +/);
                    message.channel.send(args.slice(1).join(" "));
                }
            }
            if (message.content.startsWith("!suckmode")) {
                message.channel.send(
                    "suckmode de 5 segundos activado en el canal"
                );
            }
            if (message.content.startsWith(">suckmode")) {
                message.channel.send(
                    "suckmode de 5 segundos activado en el canal"
                );
            }
        } catch (e) {
            console.error(e);
        }
    },
};
