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
            message.member.roles.cache.some(
                (role) => role.id === moderacionRoleId
            )
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
