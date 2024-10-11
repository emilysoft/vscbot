const module = async (client, text) => {
    try {
        function setPresence(client, activity) {
            client.user.setPresence({
                activities: [{ name: activity }],
                status: "online",
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
export default module
