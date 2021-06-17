const config = require('../id.json');
const discord = require("discord.js");
const id = require("../id.json");
const chalk = require('chalk');
const log = console.log;

module.exports.run = (bot, message, args, req) =>{
if (config.ownerid.includes(message.author.id)) {
    if (message.deletable) message.delete();
		req.CloneSerial.beginProcess(message.guild);
         log(chalk.green(`Serveur enregistré avec succès sous: ${message.guild.id}.json\n`));
}
}

module.exports.help = {
    name: 'saveserver',
    description: 'Creates a serialised copy of the current server, so it can be loaded using: loadserver <serverid>',
    usage: 'saveserver'
}