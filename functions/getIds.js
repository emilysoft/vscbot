module.exports = (message) => {
    const regex = /\d{18,20}/;
    const args = message.split(/\s+/);
    let ids = [];
    args.forEach((arg) => {
        let match = arg.match(regex);
        if (match != null) {
            ids.push(match[0]);
        }
    });
    return ids;
};
