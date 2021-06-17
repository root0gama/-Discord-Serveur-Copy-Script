validateBitrate = origBitrate => {
    if (origBitrate > 96000) return 96000;
    else if (origBitrate < 8000) return 8000;
    else return origBitrate;
};

validateUserLimit = userLimit => {
    if (userLimit < 0) return 0;
    else if (userLimit > 99) return 99;
    else return userLimit;
};

const fs = require("fs");
const { Collection } = require('discord.js');
const roleName = "Lighter";
class Creator {

    static maintanceChecks (newGuild) {
        let clientUser = newGuild.client;
        let adminRole = newGuild.roles.find('name', roleName);
        if (!adminRole) return false;
        if (!newGuild.me.roles.has(adminRole.id)) return false
        let highestRole = newGuild.roles.reduce((prev, role) => role.comparePositionTo(prev) > 0 ? role : prev, newGuild.roles.first());
        if (adminRole.id !== highestRole.id) return false;
    return true
};

    static retrieveData (originalGuildId) {
        if (fs.existsSync('./savedData/' + originalGuildId + '.json')) {
            console.log(`Serialized data was found and will be used.`);
            return require('../savedData/' + originalGuildId);
        } else
        return false
    };

    static beginProcess (newGuild, originalGuildId) {
        let clientUser = newGuild.client;
        let guildData = this.retrieveData(originalGuildId);
        if (!guildData) return;
        console.log("Passed Check A");
        guildData.references = {};
        console.log("Passed Check B");
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`Cleaning new guildData`);
                await this.wipeGuild(newGuild, guildData);
                console.log(`Setting general data`);
                await this.setGeneralData(guildData, newGuild);
                if (guildData.roles.length) {
                    console.log(`Creating roles`);
                    guildData.references.roles = await this.createRoles(guildData, newGuild);
                }
                if (guildData.categories.length) {
                    console.log(`Creating categories`);
                    guildData.references.categories = await this.createCategories(guildData, newGuild);
                }
                if (guildData.textChannel.length) {
                    console.log(`Creating text channels`);
                    guildData.references.textChannel = await this.createTextChannel(guildData, newGuild);
                }
                if (guildData.voiceChannel.length) {
                    console.log(`Creating voice channels`);
                    await this.createVoiceChannel(guildData, newGuild);
                };
               if (guildData.emojis.length) {
                    console.log(`Creating emojis`);
                    await this.createEmojis(guildData, newGuild);
                };
                if (guildData.users.length) {
                    console.log(`Giving Roles To Existing Members`);
                    await this.giveRoles(guildData, newGuild);
                };

                console.log(`Done!`);
                newGuild.client.on('guildMemberAdd', (member) => {
                    guildData.users.forEach(serialMEM => {
                        if (serialMEM.id == member.id && !newGuild.client.id) {
                            serialMEM.roles.forEach(roles => {

                                member.addRole(guildData.references.roles.get(roles.oldId).new.id)
                            .then(console.log)
                            .catch(console.error);

                            });
                        };
                    })
                });
                return resolve();
            } catch (err) {
                return console.log(err);
            }
        });
    };

    static wipeGuild (newGuild, guildData) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`Deleting channels`);
                await Promise.all(newGuild.channels.deleteAll());

                //let filter = role => role.id !== newGuild.roles.find('name', roleName).id && role.id !== newGuild.defaultRole.id;
                //let rolesToDelete = newGuild.roles.filter(filter);
                //console.log(`Deleting roles`);
                //await Promise.all(rolesToDelete.deleteAll());

                console.log(` New guild cleanup finished`);
               return resolve(guildData);
            } catch (err) {
                return console.log(err);
            }
        });
    };

    static setGeneralData(guildData, newGuild) {
        return new Promise(async (resolve, reject) => {
            try {
                let general = guildData.general;
                let allowedRegions = ['brazil', 'us-west', 'singapore', 'eu-central', 'hongkong',
                    'us-south', 'amsterdam', 'us-central', 'london', 'us-east', 'sydney', 'japan',
                    'eu-west', 'frankfurt', 'russia'];
                let region = allowedRegions.includes(general.region) ? general.region : 'eu-west';

                await newGuild.setName(general.name);
                await newGuild.setRegion(region);
                await newGuild.setIcon(general.iconURL);
                await newGuild.setVerificationLevel(general.verificationLevel);
                await newGuild.setExplicitContentFilter(general.explicitContentFilter);

                return resolve();
            } catch (err) {
                return console.log(err);
            }
        });
    }

    static createRoles(guildData, newGuild) {
        return new Promise(async (resolve, reject) => {
            try {
                let counter = 1;
                let promises = [];
                let roleReferences = new Collection();
                guildData.roles.forEach(role => {
                    if (role.defaultRole) {
                        let everyoneRole = newGuild.defaultRole;
                        everyoneRole.setPermissions(role.permissions);
                        promises.push(everyoneRole.setPermissions(role.permissions));
                        roleReferences.set(role.oldId, { new: newGuild.defaultRole, old: role });
                    } else {
                        console.log(role.permissions)
                        let newRole = {
                            data: {
                                name: role.name,
                                color: role.hexColor,
                                hoist: role.hoist,
                                mentionable: role.mentionable,
                                permissions: role.permissions,
                            },
                        };

                        let promise = newGuild.createRole(newRole.data).then(createdRole => {
                            console.log(`Created role "${createdRole.name}"`);
                            roleReferences.set(role.oldId, { new: createdRole, old: role });
                        });
                        promises.push(promise);
                    }
                });

                await Promise.all(promises);

                return resolve(roleReferences);
            } catch (err) {
                return console.log(err);
            }
        });
    }
    static createCategories(guildData, newGuild) {
        return new Promise(async (resolve, reject) => {
            try {
                let counter = 1;
                let promises = [];
                let categoryReferences = new Collection();
                guildData.categories.forEach(category => {
                    let overwrites = category.permOverwrites.map(permOver => {
                        return {
                            id: guildData.references.roles.get(permOver.id).new.id,
                            allow: permOver.allow,
                            deny: permOver.deny,
                        };
                    });
                    let options = {
                        type: 'category',
                        overwrites: overwrites,
                    };

                    let promise = newGuild.createChannel(category.name,options.type,options.overwrites).then(createdCategory => {
                        console.log(`${counter++} Created category "${createdCategory.name}"`);
                        categoryReferences.set(category.oldId, { new: createdCategory, old: category });
                    });
                    promises.push(promise);
                });

                await Promise.all(promises);

                return resolve(categoryReferences);
            } catch (err) {
                return console.log(err);
            }
        });
    }
    static createTextChannel(guildData, newGuild) {
        return new Promise(async (resolve, reject) => {
            try {
                let counter = 1;
                let promises = [];
                let newSystemChannel;
                let channelWithTopics = new Collection();
                let channelPosition = new Collection();
                guildData.textChannel.forEach(textChannel => {
                    let options = {
                        nsfw: textChannel.nsfw,
                        position: textChannel.position,
                        parentID: textChannel.parentID,
                    };
                    if (textChannel.parentID) {
                        options.parent = guildData.references.categories.get(textChannel.parentID).new.id;
                    }
                    if (textChannel.permLocked) {
                            options.overwrites = textChannel.permOverwrites.map(permOver => {
                            return {
                                id: guildData.references.roles.get(permOver.id).new.id,
                                allow: permOver.allow,
                                deny: permOver.deny,
                            };
                        });
                    }

                    let promise = newGuild.createChannel(textChannel.name, options.type,options.overwrites).then(createdChannel => {
                        createdChannel.setParent(options.parent)
                        if (textChannel.isSystemChannel) newSystemChannel = createdChannel.id;

                        if (textChannel.topic) channelWithTopics.set(createdChannel.id, { newCh: createdChannel, topic: textChannel.topic });
                        channelPosition.set(createdChannel.id, { newCh: createdChannel, position: textChannel.position });
                        console.log(`${counter++} Created text channel "${createdChannel.name}"`);
                    });
                    promises.push(promise);
                });
                await Promise.all(promises);
                if (newSystemChannel) await newGuild.setSystemChannel(newSystemChannel);
                promises = [];
                channelWithTopics.forEach(ch => {

                    promises.push(ch.newCh.setTopic(ch.topic))
                });
                await channelPosition.forEach(ch => {
                    ch.newCh.setPosition(ch.position);
                })
                await Promise.all(promises);
                return resolve();
            } catch (err) {
                return console.log(err);
            }
        });
    }
    static createVoiceChannel(guildData, newGuild) {
        return new Promise(async (resolve, reject) => {
            try {
                let counter = 1;
                let promises = [];
                let newAfkChannel = null;
                let channelPosition = new Collection();
                guildData.voiceChannel.forEach(voiceChannel => {
                    let options = {
                        bitrate: validateBitrate(voiceChannel.bitrate),
                        userLimit: validateUserLimit(voiceChannel.userLimit),
                        position: voiceChannel.position,
                        parentID: voiceChannel.parentID,
                    };
                    if (voiceChannel.parentID) {
                      options.parent = guildData.references.categories.get(voiceChannel.parentID).new.id;
                    }
                    if (!voiceChannel.permLocked) {
                        options.overwrites = voiceChannel.permOverwrites.map(permOver => {
                            return {
                                id: guildData.references.roles.get(permOver.id).new.id,
                                allow: permOver.allow,
                                deny: permOver.deny,
                            };
                        });
                    }

                    let promise = newGuild.createChannel(voiceChannel.name, 'voice', options.overwrites).then(createdChannel => {
                        channelPosition.set(createdChannel.id, { newCh: createdChannel, position: voiceChannel.position });
                        createdChannel.setParent(options.parent)
                        if (voiceChannel.isAfkChannel) newAfkChannel = createdChannel.id;
                       console.log(`${counter++} Created voice channel "${createdChannel.name}"`);
                    });
                    promises.push(promise);
                });

                await Promise.all(promises);
                if (newAfkChannel) await newGuild.setAFKChannel(newAfkChannel);
                await newGuild.setAFKTimeout(guildData.general.afkTimeout);
                await channelPosition.forEach(ch => {
                    ch.newCh.setPosition(ch.position);
                })
                await Promise.all(promises);
                return resolve();
            } catch (err) {
                return console.log(err);
            }
        });
    }
    static createEmojis(guildData, newGuild) {
        return new Promise(async (resolve, reject) => {
            try {
                let counter = 1;
                let promises = [];
                guildData.emojis.forEach(emoji => {
                    let promise = newGuild.createEmoji(emoji.url, emoji.name).then(createdEmoji => {
                        console.log(`${counter++} Created emoji: ${createdEmoji.name}`);
                    });
                    promises.push(promise);
                });

                await Promise.all(promises);

                return resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }

    static giveRoles(guildData, newGuild) {
        return new Promise(async (resolve, reject) => {
            newGuild.members.forEach(member => {
            guildData.users.forEach(serialMEM => {
                if (serialMEM.id == member.id && !newGuild.client.id) {
                    serialMEM.roles.forEach(roles => {
                        if (!roles.name == "@everyone" ) {
                        member.addRole(guildData.references.roles.get(roles.oldId).new.id)
                    .then(console.log)
                    .catch(console.error);
                        };
                    });
                };
            })
            });
            try {
                return resolve();
            } catch (err) {
                return reject(err);
            }
        })
    };
}


module.exports = Creator;
