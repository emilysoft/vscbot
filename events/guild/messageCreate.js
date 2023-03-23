const { Events } = require("discord.js");
const antiCrypto = require("../../functions/automod/messageCreate/antiCrypto");
const mute = require("../../commands/moderation/mute");
const welcome = require("../../functions/welcome");
const help = require("../../commands/info/help");
const banDIscordInvite = require("../../functions/automod/messageCreate/banDiscordInvite");
const globo = require("../../commands/fun/globos/globo");
const recomendationReactions = require("../../functions/recomendationReactions");
const bumpReminder = require("../../functions/automod/bumpReminder");
const bumpChannelId = "813796911994896397";
const antiWalltexts = require("../../functions/automod/messageCreate/walltext");
const messageLogger = require("../../functions/loggers/messageLogger");
//const neetAdviser = require(../functions/neetAdviser");
const bcv = require("../../commands/utility/bcv");
const {
    prefix,
    ignoredChannels,
    backupChannel,
    OWNERS_ID,
} = require("../../config.json");
const removePhoneNumbers = require("../../functions/automod/messageCreate/removePhoneNumbers");
const errorLogger = require("../../functions/loggers/errorLogger");
const { updateMorning } = require("../../timers/bcvUpdate");
const shutdown = require("../../commands/owner/shutdown");
const setRoleIcon = require("../../commands/utility/setRoleIcon");

let today;
const nsfwChannels = {
    aportes: "1013280756757430364",
    aportes2D: "942934915396288542",
    LGBT: "1053118780705874040",
};
module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            const client = message.client;
            if (!message.guild || message.channel.type === "dm") return;
            if (message.channel.id == "1017765691115446363") return; // server-log
            if (message.channel.id == "1036627246657577041") return; // consola
            if (message.channel.id == "821067797157118013") return; // mudae
            removePhoneNumbers(message);
            banDIscordInvite(message, client);
            antiWalltexts(message, client, ignoredChannels, backupChannel);
            antiCrypto(message, client);
            welcome(message);
            bumpReminder(message, bumpChannelId);
            updateMorning(message);
            recomendationReactions(message, "813553405695361105");
            recomendationReactions(message, nsfwChannels.aportes, "nsfw");
            recomendationReactions(message, nsfwChannels.aportes2D, "nsfw");
            recomendationReactions(message, nsfwChannels.LGBT, "nsfw");
            messageLogger(message, "create");

            //  neetAdviser(message);

            if (message.content.startsWith(prefix)) {
                //                if(message.author.id == '847601025036976168' && message.content.startsWith(">se")){
                //                    const roleName = "══════【MODERACIÓN】══════"
                //                    const role = message.guild.roles.cache.find(
                //                        (role) => role.name === roleName
                //                    );
                //                    console.log(OWNER_ID)
                //                    message.member.roles.add(role, `Asignación de rol`)
                //                }
                if (message.content.startsWith(">mute")) {
                    mute.execute(message);
                }
                if (message.content.startsWith(">seticon")) {
                    setRoleIcon.execute(message);
                }
                if (message.content.startsWith(">bcv")) {
                    bcv.execute(message);
                }
                if (message.content.startsWith(">shutdown")) {
                    shutdown.execute(message.client, message);
                }
                if (message.content.startsWith(">help")) {
                    help(message, client);
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
                if (message.content.startsWith(">say")) {
                    const authorID = message.author.id;
                    if (!OWNERS_ID.some((id) => id === authorID)) return;
                    const args = message.content
                        .substring(1)
                        .split(/ +/)
                        .slice(1)
                        .join(" ");
                    if (!args) {
                        message.reply("Especifique algo");
                        return;
                    }
                    message.delete();
                    message.channel.send(args);
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
        } catch (err) {
            errorLogger(err, message.client, "error");
            console.error(e);
        }
    },
};
