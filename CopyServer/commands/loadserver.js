const config = require('../id.json');
const discord = require("discord.js");
const id = require("../id.json");


module.exports.run = (bot, message, args, req) =>{
	if (config.ownerid.includes(message.author.id)) {
        if (args[0]) {
            let embed = new discord.RichEmbed()
              .setTitle("Loading Server!")
              .setDescription(`Chargement du serveur: ${args[0]}\n`)
              .setThumbnail(bot.user.avatarURL)
              .setTimestamp()
              .setColor("GREEN")
              message.channel.send(embed);
            req.CloneCreate.beginProcess(message.guild,args[0]);
        }
        else{
            let embed = new discord.RichEmbed()
            .setTitle("Command Error!")
            .setDescription(`Tu DOIS inclure un id de serveur`)
            .setThumbnail(bot.user.avatarURL)
            .setTimestamp()
            .setColor("RED")
            message.channel.send(embed);
        }
      } else {
        let embed = new discord.RichEmbed()
                .setTitle("Command Error!")
                .setDescription(`Ptdrr t ki`)
                .setThumbnail(bot.user.avatarURL)
                .setTimestamp()
                .setColor("RED")
        message.channel.send(embed);
      }
}


module.exports.help = {
    name: 'loadserver',
    description: 'Loads a serialised copy of <serverid>',
    usage: 'loadserver <serverid>'
}