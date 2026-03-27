import { GuildMember } from "discord.js"
import Client from "./interfaces/ICustomClient.js";
import dotenv from "dotenv";
dotenv.config();
const client = new Client();

client.on("clientReady", async () => {
    try {
        await client.db.connect();

        const guild = client.guilds.cache.first()
        if (!guild) return
        const roles = await guild.roles.fetch()
        const filteredRoles = roles.filter(role => role.id !== guild.id);
        const sortedRoles = filteredRoles.sort((roleA, roleB) => roleB.position - roleA.position);

        let pass = false

        for (const role of sortedRoles.values()) {
            if (role.id == "1403242072848203817") {
                pass = true
                continue
            }
            if (role.id == "1403242383793066004") break

            if (pass) {
                const member = role.members.first()
                if (!(member instanceof GuildMember)) {
                    console.log(`rol ${role.id} ${role.name} no tiene usuario`)
                    continue
                }
                console.log(`${role.id} ${role.name}`)
                member.roles.add("1403939855364391024")
                //await client.db.roles.custom.create(role, member.user, role.guild)
                //    .catch(err => console.log(err))
            }
        }
    } catch (err) {
        console.log(err)
    }
})
client
    .login(process.env.TOKEN)
    .catch((err) =>
        console.log(
            `Dont possible connect with discord - Reason: "${err.message}"`
        )
    );
