const
  Discord = require("discord.js"), 
  {token, prefix, ignoredChannels, backupChannel} = require('./config.json'),
	intents = new Discord.Intents(32767),
//  customUpload = require("../custom_uploads.js"),
  neet = "302249242469335060", 
	client = new Discord.Client({ intents }),
  onlyEnglish = require('./onlyEnglish'),
  vscLog = require('./modules/logger'),
  banner = require('./modules/banner'),
//  globo = require('./modules/globo'),
  lockChannel = require('./modules/lockChannel'),
  antiWalltexts = require('./modules/walltext'),
  {SEND_MESSAGES} =  require('./modules/permissions');

var today; 

client.on('ready', () => {
	console.log("Bot corriendo")

  setInterval(()=> {
    lockChannel(SEND_MESSAGES, client)
  }, 120000)

		client.user.setPresence({ 
		activities: [{ name: `Duck Game`}],
		status: 'online' 
	});
		setTimeout(() => {
    client.user.setPresence({ 
      activities: [{ name: `Duck Game`}],
      status: 'online' 
    });
		},300000);
});

client.on("messageCreate", async message => {
  today = new Date();
  
  console.log(`[${today.getDate()}/${(today.getMonth()+1)}/${today.getFullYear()}][${today.getHours()}:${today.getMinutes()}][${message.author.id}][${message.channel.name}] ${message.author.username}: ${message.content}`)

  antiWalltexts(message,client,ignoredChannels, backupChannel)
  onlyEnglish(message, client, vscLog)

  if(!message.content.startsWith(prefix)) return;
  if(message.content.startsWith(">upload") && message.author.id == neet){
    customUpload(message, client)
  }
  if(message.content.startsWith(">banner")){
    banner(message)
  }
  if(message.content.startsWith(">afk")){
    message.channel.send(`<@${message.author.id}> se fue pal' coño`)
  }
  if(message.content.startsWith(">wallpaper") && message.author.id == neet){
    wallpaper(message, client)
  }
//  if(message.content.startsWith(">gb")){
//    globo(message,'./media')
//  }
  if(message.content.startsWith(">say") && message.author.id == neet){
    message.delete()
      .catch(error => {
        if (error.code !== 10008) console.error('Failed to delete the message:', error);
      });
    var args = message.content.substring(1).split(/ +/);
    message.channel.send(args.slice(1).join(" "))
	}
  if(message.content.startsWith("!suckmode")){
    message.channel.send("suckmode de 5 segundos activado en el canal")
	}
})

client.on("messageUpdate", async (oldM, newM) => {
  antiWalltexts(newM,client, ignoredChannels, backupChannel)
  onlyEnglish(newM, client)
}) 

client.login(token)
