import errorLogger from "../loggers/errorLogger"
const lvl5 = "813545491957940244"
const lvl10 = "813546760152547348"
const regex = 
export default (message) => {
    try {
        if(message.member.roles.cache.some((role) => role.id === lvl5)) return
        if(message.member.roles.cache.some((role) => role.id === lvl10)) return
    

    } catch (err) {
        errorLogger(err, message.client, "error", import.meta.url);
    }
};
