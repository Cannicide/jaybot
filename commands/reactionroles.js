//Command to create Reaction Roles systems on any existing message.

var Command = require("../command");
const ReactionInterpreter = require("../interpreter").ReactionLode;
const Reactions = new ReactionInterpreter("reactionroles");

function addRole(r, u) {

    var reactionrole = Reactions.fetch(Reactions.findSortedIndex(r.message.id));
    var roleName = reactionrole.role;
    var role = r.message.guild.roles.cache.find(rol => rol.name.toLowerCase() == roleName.toLowerCase());

    if (role) {

        var mem = r.message.guild.member(u.id);

        if (mem) {
            mem.roles.add(role, "Panacea Reaction Role System.")
            .then(() => mem.send(`You gained the *${roleName}* role in **${r.message.guild.name}**!`).catch(console.log))
            .catch(() => mem.send("I was unable to give you that role. Please try again or contact Cannicide#2753.").catch(console.log));
        }

    }

}

function removeRole(r, u) {

    var reactionrole = Reactions.fetch(Reactions.findSortedIndex(r.message.id));
    var roleName = reactionrole.role;
    var role = r.message.guild.roles.cache.find(rol => rol.name.toLowerCase() == roleName.toLowerCase());

    if (role) {

        var mem = r.message.guild.member(u.id);

        if (mem) {
            mem.roles.remove(role, "Panacea Reaction Role System.")
            .then(() => mem.send(`You removed your *${roleName}* role in **${r.message.guild.name}**!`).catch(console.log))
            .catch(() => mem.send("I was unable to remove that role from you. Please try again or contact Cannicide#2753.").catch(console.log));
        }

    }

}

function createRole(message, color, name, mentionable) {

    if (message.guild.roles.cache.find(r => r.name.toLowerCase() == name.toLowerCase())) return message.reply(`unable to create the role; the role with name **${name}** already exists.`);

    message.guild.roles.create({
        data: {
          name: name,
          color: color,
          mentionable: mentionable
        },
        reason: 'Panacea role-creation utility.',
      })
        .then(() => {
            message.reply(`successfully created the role: **${name}**.`);
        })
        .catch(() => {
            message.reply(`failed to create the role: **${name}**.`);
        });

}

async function createReactionRole(message, targetID, roleName, reaction) {

    var target = false;
    for (var channel of message.guild.channels.cache.array()) {
        if (channel.type.toLowerCase() == "text") {
            var foundMsg = false;

            try {
                var foundMsg = await channel.messages.fetch(targetID);
            }
            catch (err) {
                foundMsg = false;
            }

            if (foundMsg) {
                target = foundMsg;
                break;
            }
        }

        continue;
    };

    if (!target) return message.channel.send("Unable to find a message with that ID in this guild.");

    var orig_reaction = reaction;
    reaction = reaction.match(":") ? reaction.substring(reaction.lastIndexOf(":") + 1).replace(">", "") : reaction;

    var reacts = target.reactions.cache.find(r => r.emoji.name == reaction || r.emoji.id == reaction);

    var role = message.guild.roles.cache.find(rol => rol.name.toLowerCase() == roleName.toLowerCase());
    if (!role) return message.channel.send("Unable to find a role with that name in this guild.");

    if (Reactions.findSortedIndex(target.id) != -1) {
        //Reaction role system already exists on message; remove the system from the message.

        if (reacts) reacts.remove();
        Reactions.remove(Reactions.findSortedIndex(target.id));

        message.reply("successfully disabled the Reaction Role System on that message.");

    }
    else {
        //Reaction role system doesn't already exist on message; add the system to the message.

        target.react(reaction);

        Reactions.add(target, message.author, [reaction], {role:roleName});
        message.reply(`successfully enabled the Reaction Role System on that message.\nUsers can now gain the role **${roleName}** by reacting with ${orig_reaction} on that message!`);

    }

}

module.exports = {
    commands: [

        new Command("reactionrole", {
            perms: ["ADMINISTRATOR"],
            desc: "Adds a 'reaction role' system to a specified existing message.",
            aliases: ["reactionroles", "reactrole", "reactroles"],
            args: [
                {
                    name: "message ID",
                    feedback: "Please specify the ID of the existing message to add a Reaction Role system to."
                },
                {
                    name: "reaction emote",
                    feedback: "Please specify the emote (full emote, not just ID or name) to use in the reactions."
                },
                {
                    name: "role name",
                    feedback: "Please specify the name of the role to be given to users that react to the message."
                }
            ]
        }, (message) => {

            var id = message.args[0];
            var reaction = message.args[1];
            var roleName = message.args.slice(2).join(" ");

            createReactionRole(message, id, roleName, reaction);

        }),

        new Command("createrole", {
            perms: ["ADMINISTRATOR"],
            desc: "Creates a role with the specified name and color.",
            args: [
                {
                    name: "role color",
                    feedback: "Please specify the hex color of the role to be created."
                },
                {
                    name: "role name",
                    feedback: "Please specify the name of the role to be created."
                },
                {
                    name: "mn",
                    flag: "Makes role mentionable by everyone."
                }
            ]
        }, (message) => {

            var color = message.args[0];
            var roleName = message.args.slice(1).join(" ");

            createRole(message, color, roleName, message.flags.includes("-mn"));

        })

    ],
    initialize: function() {

        //Setup poll vote adding
        Reactions.register({
            filter: (inCache, isAdding) => inCache.type == "reactionroles" && isAdding,
            response: addRole
        });

        //Setup poll vote retracting
        Reactions.register({
            filter: (inCache, isAdding) => inCache.type == "reactionroles" && !isAdding,
            response: removeRole
        });

    }
}