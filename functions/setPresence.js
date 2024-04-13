module.exports = async (client, text) => {
    try {
        function setPresence(client, activity) {
            client.user.setPresence({
                activities: [{ name: activity }],
                status: "invisible",
            });
        }
        setPresence(client, text);
        //setTimeout(() => {
        //    setPresence(client, text);
        //}, 300000);
    } catch (err) {
        errorLogger(err, client, "error");
    }
};
