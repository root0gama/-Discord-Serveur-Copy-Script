const Discord = require('discord.js')
 client = new Discord.Client()
 token = ""
 const superagent = require("superagent")
 const fs = require("fs");
 client.commands = new Discord.Collection();
 https = require("https");
 gifSearch = require("gif-search");
 ms = require("ms");
 con = console.log
const Req = {
  "fs" : require('fs'),
  "CloneCreate" : require("./Cloner/Creator.js"),
  "CloneSerial" : require("./Cloner/Serializer.js"),
  };
//////////////////////////
/////////LOGIN///////////
////////////////////////

client.login(token)

client.on("ready", () => {
	console.log(

		`|  => .saveserver for copy server \n => .loadserver for paste server !`)
})


//////////////////////////
////////COMMAND//////////
////////////////////////

client.on("message", async msg => {

	if (msg.author.id !== client.user.id) return;

fs.readdir("./commands/", (err, files) =>  {

  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js")
  if(jsfile.lenght <= 0){
    console.log("Commande introuvable.")
    return;
  }

  jsfile.forEach((f, i) =>{
    let props = require(`./commands/${f}`);
		if (props.help && props.help.name) {
			client.commands.set(props.help.name, props);
		}
  });
});
    let prefix = "."
	let messageArray = msg.content.split(/ +/g);
    let cmd = messageArray.shift().slice(prefix.length)
    let args = messageArray
    let commandfile = client.commands.get(cmd);
	if(commandfile) commandfile.run(client,msg,args, Req);
})
