const fs = require('fs');
class Serializer {

    static saveData (name, jsonData) {
        return fs.writeFileSync("./savedData/" + name + '.json', jsonData);
    };

    static beginProcess (originalGuild) {
       console.log("Passed Check A");
       console.log("Passed Check B");
       console.log("Passed Check C");
       console.log("Passed Check D");
       console.log("Passed Check E");
       console.log("Passed Check F");
       console.log("Passed Check G");
       console.log("Passed Check H");
       console.log("Passed Check I");
       console.log("Passed Check J");
       console.log("Passed Check K");
       console.log("Passed Check L");
        if (!originalGuild.available) return console.log('Original guild not available. Please try again later.');
        let collectedData = {};

        console.log(`Serializing general data`);
        collectedData.general = this.generalData(originalGuild);

        console.log(`Serializing role data`);
        collectedData.roles = collectedData.roles = this.serializeRoles(originalGuild);
        console.log(`Serialized ${collectedData.roles.length} role(s)`);

        console.log("Serializing user data!");
        collectedData.users = this.serializeUsers(originalGuild);
        console.log(`Serialized ${collectedData.users.length} user(s)!`);
        console.log(`Serializing category data`);
        console.log("Passed Check M");
 
        collectedData.categories = this.serializeCategories(originalGuild);
        console.log(`Serialized ${collectedData.categories.length} category(ies)`);
        console.log(`Serializing text channel data`);
        console.log("Passed Check O");

        collectedData.textChannel = this.serializeTextChannels(originalGuild);
        console.log(`Serialized ${collectedData.textChannel.length} text channel(s)`);
        console.log(`Serializing voice channel data`);
        console.log("Passed Check P");

        collectedData.voiceChannel = this.serializeVoiceChannels(originalGuild);
        console.log(`Serialized ${collectedData.voiceChannel.length} voice channel(s)`);
        console.log("Passed Check Q");

        console.log(`Serializing emojis`);
        collectedData.emojis = this.serializeEmojis(originalGuild);
        console.log(`Serialized ${collectedData.emojis.length} emoji(s)`);
        console.log("Passed Check R");
        console.log("Passed Check S");
        console.log(`Saving guild data to file`);
        this.saveData (originalGuild.id, JSON.stringify(collectedData))
       console.log("Passed Check T");
       console.log("Passed Check U");
       console.log("Passed Check V");
       console.log("Passed Check W");
       console.log("Passed Check X");
       console.log("Passed Check Y");
       console.log("Passed Check Z");
      console.log(`Serialization finished and data saved as ${originalGuild.id}.json`);
        return collectedData;
    };

static generalData (guild) {
    return {
        oldId: guild.id,
        name: guild.name,
        reigon: guild.region,
        iconURL: guild.iconURL,
        verificationLevel: guild.verificationLevel,
        afkTimeout: guild.afkTimeout,
        explicitContentFilter: guild.explicitContentFilter,
    };
};

static serializeEmojis (guild) {
    return guild.emojis.map(emoji => {
        let emojiData = {
          name: emoji.name,
           url: emoji.url,  
};
       return emojiData;
    });
}

static serializeUsers (guild) {
  let collectedMembers = guild.members;
  let buyerRole = guild.roles.find("name", "@everyone");
  return collectedMembers.filter(m => m.roles.has(buyerRole.id)).map(member => {
    let memberRoles = member.roles;
    let memberRolesReturn = memberRoles.map(role => {
      return {
        oldId: role.id,
        name: role.name,
        defaultRole: guild.defaulRole == role.id,
      }
    });
    let memberData = {
      id: member.id,
      serverDeaf: member.serverDeaf,
      serverMute: member.serverMute,
      nickname: member.nickname,
      roles: memberRolesReturn,
    };
    return memberData;
  });
};

static serializeRoles (guild) {
    let roleCollection = guild.roles.sort((a, b) => b.position - a.position);
    return roleCollection.map(role => {
        let roleData = {
            oldId: role.id,
            name: role.name,
            hexColor: role.hexColor,
            hoist: role.hoist,
            mentionable: role.mentionable,
            position: role.position,
            rawPosition: role.rawPosition,
            defaultRole: guild.defaultRole.id === role.id,
            permissions: role.permissions,
        };
        return roleData;
    })
};

static serializeCategories (guild) {
    let collectedCatagories = guild.channels.filter(c => c.type === 'category');
    let categoryCollection = collectedCatagories.sort((a, b) => a.position - b.position);
    return categoryCollection.map(category => {
        let permOverwritesCollection = category.permissionOverwrites.filter(pOver => pOver.type === 'role');
        let permOverwrites = permOverwritesCollection.map(pOver => {
            //console.log(pOver);
            return {
                id: pOver.id,
                allow: pOver.allow,
                deny: pOver.deny,
            };
        });

        return {
            oldId: category.id,
            name: category.name,
            position: category.position,
            rawPosition: category.rawPosition,
            permOverwrites: permOverwrites,
        };
    });
};

static serializeTextChannels (guild) {
    let collectedTextChannels = guild.channels.filter(c => c.type === 'text');
    let textChannelCollection = collectedTextChannels.sort((a, b) => a.position - b.position);
    return textChannelCollection.map(tCh => {
        let permOverwritesCollection = tCh.permissionOverwrites.filter(pOver => pOver.type === 'role');
        let permOverwrites = permOverwritesCollection.map(pOver => {
            return {
                id: pOver.id,
                allow: pOver.allow,
                deny: pOver.deny,
            };
        });

        return {
            id: tCh.id,
            name: tCh.name,
            topic: tCh.topic,
            nsfw: tCh.nsfw,
            isSystemChannel: guild.systemChannelID === tCh.id,
            position: tCh.position,
            rawPosition: tCh.rawPosition,
            parentID: tCh.parentID,
            permissionsLocked: tCh.permissionsLocked ? tCh.permissionsLocked : false,
            permOverwrites: tCh.permissionsLocked ? null : permOverwrites,
        };
    });
};

static serializeVoiceChannels (guild) {
    let collectedVoiceChannels = guild.channels.filter(c => c.type === 'voice');
    let voiceChannelCollection = collectedVoiceChannels.sort((a, b) => a.position - b.position);
    return voiceChannelCollection.map(vCh => {
        let permOverwritesCollection = vCh.permissionOverwrites.filter(pOver => pOver.type === 'role');
        let permOverwrites = permOverwritesCollection.map(pOver => {
            return {
                id: pOver.id,
                allow: pOver.allow,
                deny: pOver.deny,
            };
        });

        return {
            id: vCh.id,
            name: vCh.name,
            position: vCh.position,
            rawPosition: vCh.rawPosition,
            parentID: vCh.parentID,
            bitrate: vCh.bitrate,
            userLimit: vCh.userLimit,
            isAfkChannel: guild.afkChannelID === vCh.id,
            permissionsLocked: vCh.permissionsLocked ? vCh.permissionsLocked : false,
            permOverwrites: vCh.permissionsLocked ? null : permOverwrites,
        };
    });
  };
};

module.exports = Serializer;