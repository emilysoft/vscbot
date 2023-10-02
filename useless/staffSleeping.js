const { PermissionsBitField } = require("discord.js");
const errorLogger = require("../functions/loggers/errorLogger");

const permisosPermitidos = {
    AttachFiles: true,
    EmbedLinks: true,
};
const generalId = "813538324320092164";
const guildId = "813538324320092161";
const userRoles = {
    lvl5: "813545491957940244",
    lvl10: "813546760152547348",
    boc: "824041590166781962",
    socio: "813967666003181618",
    billete: "813847213582188544",
    moderacion: "813568302294761486",
};
const botRoles = {
    notsobot: "813539844076470303",
};
module.exports = {
    async sleep(client) {
        try {
            let guild = await client.guilds.cache.get(guildId);
            let everyone = await guild.roles.cache.find(
                (r) => r.id === guildId
            );

            // SLOWMODE 3s
            general = await guild.channels.cache.find(
                (channel) => channel.id === generalId
            );
            while (typeof general == "undefined") {
                general = await guild.channels.cache.find(
                    (channel) => channel.id === generalId
                );
            }
            console.log("Activando sleep mode: slowmode de 3 segundos...");
            await general
                .setRateLimitPerUser(3, "sleep mode on")
                .then(() => console.log("slowmode de 3 segundos activado"));

            //Deactivating user's role permissions
            console.log("Activando sleep mode");
            for (roleID of userRoles) {
                let role = await guild.roles.cache.find((r) => r.id === roleID);
                console.log(`Desactivando permisos para ${role.name}`);

                await general.permissionOverwrites
                    .edit(role, {
                        AttachFiles: false,
                        EmbedLinks: false,
                    })
                    .then(() => console.log(`Permisos ${role.name} denegados`));
            }
            //Deactivating bot's role permissions
            for (roleID of botRoles) {
                let role = await guild.roles.cache.find((r) => r.id === roleID);
                console.log(`Desactivando permisos para ${role.name}`);

                await general.permissionOverwrites
                    .edit(role, {
                        ViewChannel: false,
                        SendMessages: false,
                    })
                    .then(() => console.log(`Permisos ${role.name} denegados`));
            }
            //deactivating command slashes for everyone
            await general.permissionOverwrites
                //.edit("813538324320092161", { UseApplicationCommands: false })
                .edit({ UseApplicationCommands: false })
                .then(() => console.log("permisos everyone denegados"));

            console.log("Avisando a los usuarios");
            await general.send({
                files: [
                    "https://cdn.discordapp.com/attachments/1024260771326197781/1066244806415753286/images.jpg",
                ],
            });
            //cambiando permisos generales
            console.log("cambiando permisos del everyone");
            await everyone
                .setPermissions([
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.ReadMessageHistory,
                    PermissionsBitField.Flags.UseVAD,
                    PermissionsBitField.Flags.RequestToSpeak,
                    PermissionsBitField.Flags.EmbedLinks,
                    PermissionsBitField.Flags.AddReactions,
                ])
                .then(() => console.log("permisos cambiados"));
            //expulsados usuarios del vc
            console.log("expulsando usuarios del vc...");
            await guild.channels.cache.find((channel) => {
                if (channel.isVoiceBased()) {
                    channel.members.find((member) => {
                        member
                            .edit({ channel: null, reason: "sleep mode on" })
                            .then(() =>
                                console.log(
                                    `${member.user.username} expulsado del vc de ${channel.name}`
                                )
                            );
                    });
                }
            });
        } catch (err) {
            errorLogger(err, client, "error");
        }
    },
    async wakeUp(client) {
        let guild = await client.guilds.cache.get(guildId),
            everyone = await guild.roles.cache.find((r) => r.id === guildId),
            level5 = await guild.roles.cache.find(
                (r) => r.id === "813545491957940244"
            ),
            level10 = await guild.roles.cache.find(
                (r) => r.id === "813546760152547348"
            ),
            boc = await guild.roles.cache.find(
                (r) => r.id === "824041590166781962"
            ),
            socio = await guild.roles.cache.find(
                (r) => r.id === "813967666003181618"
            ),
            billete = await guild.roles.cache.find(
                (r) => r.id === "813847213582188544"
            ),
            moderacion = await guild.roles.cache.find(
                (r) => r.id === "813568302294761486"
            );
        notsobot = await guild.roles.cache.find(
            (r) => r.id === "813539844076470303"
        );
        general = await guild.channels.cache.find(
            (channel) => channel.id === generalId
        );

        while (typeof general == "undefined") {
            general = await guild.channels.cache.find(
                (channel) => channel.id === generalId
            );
        }
        try {
            console.log("desactivando sleep mode: slowmode de 3 segundos ");
            await general
                .setRateLimitPerUser(0, "sleep mode off")
                .then(() => console.log("slowmode desactivado"));
            console.log(
                "desactivando sleep mode: cambiando permisos para los level 10... "
            );
            await general.permissionOverwrites
                .edit(level10, permisosPermitidos)
                .then(() => console.log("permisos lvl10 restablecido"));
            console.log(
                "desactivando sleep mode:  cambiando permisos para los level 5..."
            );
            await general.permissionOverwrites
                .edit(level5, permisosPermitidos)
                .then(() => console.log("permisos lvl5 restablecido"));
            console.log(
                "desactivando sleep mode:  cambiando permisos para los boc..."
            );
            await general.permissionOverwrites
                .edit(boc, permisosPermitidos)
                .then(() => console.log("permisos boc restablecido"));
            console.log(
                "desactivando sleep mode:  cambiando permisos para los socios..."
            );
            await general.permissionOverwrites
                .edit(socio, permisosPermitidos)
                .then(() => console.log("permisos socios restablecido"));
            console.log(
                "desactivando sleep mode:  cambiando permisos para los del billete..."
            );
            await general.permissionOverwrites
                .edit(billete, permisosPermitidos)
                .then(() => console.log("permisos elbillete restablecido"));
            console.log(
                "desactivando sleep mode:  cambiando permisos para la moderacion..."
            );
            await general.permissionOverwrites
                .edit(moderacion, permisosPermitidos)
                .then(() => console.log("permisos moderacion restablecido"));
            console.log(
                "desactivando sleep mode:  cambiando permisos para la notsobot"
            );
            await general.permissionOverwrites
                .edit(notsobot, { ViewChannel: true, SendMessages: true })
                .then(() => console.log("permisos notsobot restablecidos"));
            console.log(
                "desactivando sleep mode:  cambiando permisos para la everyone"
            );
            await general.permissionOverwrites
                .edit("813538324320092161", { UseApplicationCommands: true })
                .then(() => console.log("permisos everyone activados"));

            console.log("cambiando permisos del everyone");
            await everyone
                .setPermissions([
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ViewChannel,
                    //PermissionsBitField.Flags.CreateInstantInvite,
                    PermissionsBitField.Flags.ReadMessageHistory,
                    PermissionsBitField.Flags.UseVAD,
                    //          PermissionsBitField.Flags.UseApplicationCommands,
                    PermissionsBitField.Flags.RequestToSpeak,
                    PermissionsBitField.Flags.Stream,
                    PermissionsBitField.Flags.UseExternalStickers,
                    PermissionsBitField.Flags.UseExternalEmojis,
                    PermissionsBitField.Flags.EmbedLinks,
                    PermissionsBitField.Flags.AddReactions,
                    PermissionsBitField.Flags.Connect,
                    PermissionsBitField.Flags.Speak,
                    PermissionsBitField.Flags.ChangeNickname,
                ])
                .then(() => console.log("permisos cambiados"));
            await general.send({
                files: [
                    "https://cdn.discordapp.com/attachments/813567370135339058/855822348887392256/BOM_DIA1-T_j6WPnFhII.mp4",
                ],
            });
        } catch (err) {
            console.log(err);
        }
    },
    async auto(hoy, client) {
        let hour = hoy.getHours();
        let minutes = hoy.getMinutes();

        if (hour == 3 && minutes == 0) {
            this.sleep(client);
        } else if (hour == 6 && minutes == 0) {
            this.wakeUp(client);
        }
    },
};
