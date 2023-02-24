const { PermissionsBitField } = require("discord.js");
const permisosDenegados = {
  AttachFiles: false,
  EmbedLinks: false,
};
const permisosPermitidos = {
  AttachFiles: true,
  EmbedLinks: true,
};
const generalId = "813538324320092164";
const guildId = "813538324320092161";

module.exports = async (hoy, client) => {
  hora = hoy.getHours();
  minutos = hoy.getMinutes();
  //comprueba si son las 3
  if (hora == 3 && minutos == 0) {
    var guild = await client.guilds.cache.get(guildId),
      everyone = await guild.roles.cache.find((r) => r.id === guildId),
      level5 = await guild.roles.cache.find(
        (r) => r.id === "813545491957940244"
      ),
      level10 = await guild.roles.cache.find(
        (r) => r.id === "813546760152547348"
      ),
      boc = await guild.roles.cache.find((r) => r.id === "824041590166781962"),
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
      console.log("activando sleep mode: slowmode de 3 segundos...");
      await general
        .setRateLimitPerUser(3, "sleep mode on")
        .then(() => console.log("slowmode de 3 segundos activado"))
        .catch((error) => console.error(error));

      console.log(
        "activando sleep mode: cambiando permisos para los level 10..."
      );
      await general.permissionOverwrites
        .edit(level10, permisosDenegados)
        .then(() => console.log("permisos lvl10 denegados"))
        .catch((error) => console.error(error));
      console.log(
        "activando sleep mode:  cambiando permisos para los level 5..."
      );
      await general.permissionOverwrites
        .edit(level5, permisosDenegados)
        .then(() => console.log("permisos lvl5 denegados"))
        .catch((error) => console.error(error));
      console.log("activando sleep mode:  cambiando permisos para los boc...");
      await general.permissionOverwrites
        .edit(boc, permisosDenegados)
        .then(() => console.log("permisos boc denegados"))
        .catch((error) => console.error(error));
      console.log(
        "activando sleep mode:  cambiando permisos para los socios..."
      );
      await general.permissionOverwrites
        .edit(socio, permisosDenegados)
        .then(() => console.log("permisos socios denegados"))
        .catch((error) => console.error(error));
      console.log(
        "activando sleep mode:  cambiando permisos para los del billete"
      );
      await general.permissionOverwrites
        .edit(billete, permisosDenegados)
        .then(() => console.log("permisos billete denegados"))
        .catch((error) => console.error(error));
      console.log(
        "activando sleep mode:  cambiando permisos para la moderacion"
      );
      await general.permissionOverwrites
        .edit(moderacion, permisosDenegados)
        .then(() => console.log("permisos moderacion denegados"))
        .catch((error) => console.error(error));
      console.log("activando sleep mode:  cambiando permisos para la notsobot");
      await general.permissionOverwrites
        .edit(notsobot, { ViewChannel: false, SendMessages: false })
        .then(() => console.log("permisos notsobot denegados"))
        .catch((error) => console.error(error));
      console.log("activando sleep mode:  cambiando permisos para la everyone");
      await general.permissionOverwrites
        .edit("813538324320092161", { UseApplicationCommands: false })
        .then(() => console.log("permisos everyone denegados"))
        .catch((error) => console.error(error));
      console.log("Avisando a los usuarios");
      await general
        .send(
          "https://cdn.discordapp.com/attachments/1024260771326197781/1066244806415753286/images.jpg"
        )
        .catch((e) => console.error(e));
      console.log("cambiando permisos del everyone");
      await everyone
        .setPermissions([
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ViewChannel,
          //PermissionsBitField.Flags.CreateInstantInvite,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.UseVAD,
          //        PermissionsBitField.Flags.UseApplicationCommands,
          PermissionsBitField.Flags.RequestToSpeak,
          //PermissionsBitField.Flags.Stream,
          //PermissionsBitField.Flags.UseExternalStickers,
          //PermissionsBitField.Flags.UseExternalEmojis,
          PermissionsBitField.Flags.EmbedLinks,
          PermissionsBitField.Flags.AddReactions,
          //PermissionsBitField.Flags.Connect,
          //PermissionsBitField.Flags.Speak,
          //PermissionsBitField.Flags.ChangeNickName,
        ])
        .then(() => console.log("permisos cambiados"));
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
              )
              .catch((err) => console.log(err));
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
  } else if (hora == 6 && minutos == 0) {
    var guild = await client.guilds.cache.get(guildId),
      everyone = await guild.roles.cache.find((r) => r.id === guildId),
      level5 = await guild.roles.cache.find(
        (r) => r.id === "813545491957940244"
      ),
      level10 = await guild.roles.cache.find(
        (r) => r.id === "813546760152547348"
      ),
      boc = await guild.roles.cache.find((r) => r.id === "824041590166781962"),
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
        .then(() => console.log("slowmode desactivado"))
        .catch((error) => console.error(error));
      console.log(
        "desactivando sleep mode: cambiando permisos para los level 10... "
      );
      await general.permissionOverwrites
        .edit(level10, permisosPermitidos)
        .then(() => console.log("permisos lvl10 restablecido"))
        .catch((error) => console.error(error));
      console.log(
        "desactivando sleep mode:  cambiando permisos para los level 5..."
      );
      await general.permissionOverwrites
        .edit(level5, permisosPermitidos)
        .then(() => console.log("permisos lvl5 restablecido"))
        .catch((error) => console.error(error));
      console.log(
        "desactivando sleep mode:  cambiando permisos para los boc..."
      );
      await general.permissionOverwrites
        .edit(boc, permisosPermitidos)
        .then(() => console.log("permisos boc restablecido"))
        .catch((error) => console.error(error));
      console.log(
        "desactivando sleep mode:  cambiando permisos para los socios..."
      );
      await general.permissionOverwrites
        .edit(socio, permisosPermitidos)
        .then(() => console.log("permisos socios restablecido"))
        .catch((error) => console.error(error));
      console.log(
        "desactivando sleep mode:  cambiando permisos para los del billete..."
      );
      await general.permissionOverwrites
        .edit(billete, permisosPermitidos)
        .then(() => console.log("permisos elbillete restablecido"))
        .catch((error) => console.error(error));
      console.log(
        "desactivando sleep mode:  cambiando permisos para la moderacion..."
      );
      await general.permissionOverwrites
        .edit(moderacion, permisosPermitidos)
        .then(() => console.log("permisos moderacion restablecido"))
        .catch((error) => console.error(error));
      console.log(
        "desactivando sleep mode:  cambiando permisos para la notsobot"
      );
      await general.permissionOverwrites
        .edit(notsobot, { ViewChannel: true, SendMessages: true })
        .then(() => console.log("permisos notsobot restablecidos"))
        .catch((error) => console.error(error));
      console.log(
        "desactivando sleep mode:  cambiando permisos para la everyone"
      );
      await general.permissionOverwrites
        .edit("813538324320092161", { UseApplicationCommands: true })
        .then(() => console.log("permisos everyone activados"))
        .catch((error) => console.error(error));

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
    } catch (err) {
      console.log(err);
    }
  }
};
