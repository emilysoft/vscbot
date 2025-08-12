import { Message } from "discord.js";

const regex =
    /([^.\w\d\-_:?/]+|^)(5([-.\s\n_]+)?8)?0?(4([-.\s\n_]+)?1([-.\s\n_]+)?4([-.\s\n_]+)?|4([-.\s\n_]+)?2([-.\s\n_]+)?4([-.\s\n_]+)?|4([-.\s\n_]+)?1([-.\s\n_]+)?2([-.\s\n_]+)?|4([-.\s\n_]+)?2([-.\s\n_]+)?6([-.\s\n_]+)?|4([-.\s\n_]+)?1([-.\s\n_]+)?6([-.\s\n_]+)?|2([-.\s\n_]+)?1([-.\s\n_]+)?2([-.\s\n_]+)?)(\d([-.\s\n_]+)?){7}([^.\w\d\-_:/]+|$)/gm;
const module = (message: Message) => {
    return message.content.match(regex);
};

export default module
