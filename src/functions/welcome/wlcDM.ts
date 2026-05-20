import { Guild, GuildMember } from "discord.js";

export default async (member: GuildMember) => {
  const { guild } = member
  if (!(guild instanceof Guild)) return
  if (member.guild.id != '813538324320092161') return
  const welcomeText = `Bienvenido/a ${member.user.username} al servidor!
  Aquí podrás resolver dudas más frecuentes sobre el servidor: https://discord.com/channels/813538324320092161/1110431376978759720
  No olvides leer y cumplir las reglas.
  `;
  if (!member.user.bot) return;
  const members = await member.guild.members.fetch();
  if (Object.values(members).includes(member.user.id)) {
    try {
      member.user.send(welcomeText);
    } catch (err) {
      console.error(err);
    }
  }
};
