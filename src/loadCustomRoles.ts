import { GuildMember } from "discord.js"
import Client from "./interfaces/ICustomClient.js";
import dotenv from "dotenv";
dotenv.config();
const client = new Client();

client.on("ready", async () => {
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
//
//async function loadCustomRoles() {
//    const usersID = [];
//    const regex =
//        /^\[[\w\:_\-\/\d]+\]\[[\w\:_\-\/\d]+\]\[[\w\:_\-\/\d]+\]\[(\d{10,})\]\[.*(debates)\]/;
//    let id, match, user, cant;
//
//    const links = []
//    const logFile = fs
//        .readdirSync(path.join(process.cwd(), "./logs/out/"))
//        .filter((file) => file.endsWith("log"));
//    let mano = 0
//    let pana = 0
//    for (const file of logFile) {
//        let filePath = path.join(process.cwd(), `./${file}`);
//        const log = fs.readFileSync(filePath, "utf8").split(/\n/);
//        log.forEach(line => {
//            let l = line.split(":").pop()
//            if (!l) return
//
//            if (l.match(/\bvsc\b/gim)) {
//                mano++
//            } else if (l.match(/\bpana\b/)) {
//                pana++
//            }
//            console.clear()
//            console.log(`mano: ${mano}\n pana: ${pana}`)
//        });
//    }
//}
//async function loadCustomRoles() {
//    const usersID = [];
//    const regex =
//        /^\[[\w\:_\-\/\d]+\]\[[\w\:_\-\/\d]+\]\[[\w\:_\-\/\d]+\]\[(\d{10,})\]\[.*(debates)\]/;
//    let id, match, user, cant;
//
//    const links = []
//    const logFile = fs
//        .readdirSync(path.join(process.cwd(), "./"))
//        .filter((file) => file.endsWith("log"));
//    let mano = 0
//    let pana = 0
//    for (const file of logFile) {
//        let filePath = path.join(process.cwd(), `./${file}`);
//        const log = fs.readFileSync(filePath, "utf8").split(/\n/);
//        log.forEach(line => {
//            let l = line.split(":").pop()
//            if (!l) return
//
//            if (l.match(/\bvsc\b/gim)) {
//                mano++
//            } else if (l.match(/\bpana\b/)) {
//                pana++
//            }
//            console.clear()
//            console.log(`mano: ${mano}\n pana: ${pana}`)
//        });
//    }
//}
//const links = []
//const logFile = fs
//    .readdirSync(path.join(process.cwd(), "./"))
//    .filter((file) => file.endsWith("log"));
//for (const file of logFile) {
//    let filePath = path.join(process.cwd(), `./${file}`);
//    const log = fs.readFileSync(filePath, "utf8").split(/\n/);
//    log.forEach(line => {
//        match = line.match(/https:\/\/vm\.tiktok\.com\/[\w\d]+/gim)
//        if(!match) return
//        if(links.includes(match[0])) return
//        console.log(match[0])
//        links.push(match[0])
//    });
//}
//fs.writeFileSync("tiktoks.txt", links.join("\n"), { flag: "a+" }, (err) => {
//    if (err) console.error(err);
//});

//
//let i = 0;
//const users = new Map()
//for (const file of logFile) {
//    let filePath = path.join(process.cwd(), `../${file}`);
//    const log = fs.readFileSync(filePath, "utf8").split(/\n/);
//    log.forEach(line => {
//        match = line.match(regex)
//        if(!match) return
//        id = match[1]
//        if(users.has(id)) {
//            cant = users.get(id)
//            users.set(id, ++cant)
//        } else {
//            users.set(id, 0)
//        }
//
//    });
//}
//for(const [id, cantidad] of users) {
//    if(cantidad ==0) continue
//    fs.writeFileSync("debatidores.txt", id + "\n", { flag: "a+" }, (err) => {
//        if (err) console.error(err);
//    });
//}

//match = line.match(regex);
//if (match) {
//    id = match[1];
//    if (!usersID.includes(id)) {
//        usersID.push(id);
//        console.log()
//        //console.log(usersID.length)
//        //fs.writeFileSync("lista.txt", id + "\n", { flag: "a+" }, (err) => {
//        //    if (err) console.error(err);
//        //  });
//    }
//}
////////////

//const fs = require("fs");
//const path = require("path");
//const usersID = [];
//const regex =
//    /^\[[\w\:_\-\/\d]+\]\[[\w\:_\-\/\d]+\]\[[\w\:_\-\/\d]+\]\[(\d{10,})\]/;
//const text =
//    "[:green_circle:][12/8/2024][9:42][700555231683149825][�・general] 1kiod: que no falten los lentes de beisbolista esos";
////const file = fs.readFileSync("./2024-8-12.log", "utf8");
//let id, match;
//
//const logFile = fs
//    .readdirSync(path.join(__dirname, `./`))
//    .filter((file) => file.endsWith("log"));
//for (const file of logFile) {
//    let filePath = path.join(__dirname, `./${file}`);
//    const log = fs.readFileSync(filePath, "utf8").split(/\n/);
//    log.forEach(line => {
//    match = line.match(regex);
//    if (match) {
//        id = match[1];
//        if (!usersID.includes(id)) {
//            usersID.push(id);
//            console.log(usersID.length)
//            fs.writeFileSync("lista.txt", id + "\n", { flag: "a+" }, (err) => {
//                if (err) console.error(err);
//              });
//        }
//    }
//    });
//}
//
//

