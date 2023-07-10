const Vidar = require("djs-vidar");
const rr = require("../systems/reactionroles");
const { Discord, wait } = require("../panacea");

Vidar.command("reactionrole", "Toggles a reaction role on a message.")
.argument("<message_id>")
.argument("<emoji>")
.argument("<role_name>")
.require("Administrator")
.action(async i => {
    await i.deferReply({ ephemeral: true });
    const { message_id, emoji, role_name } = Vidar.args(i);

    let matchedEmoji = emoji.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}|\d{18}/gu);
    if (!matchedEmoji) return i.editReply("Failed to add a reaction role; invalid emoji provided.");
    const reaction = Discord.parseEmoji((Array.isArray(matchedEmoji) ? matchedEmoji[0] : matchedEmoji).trim());

    const role = rr.getRoleFromName(i.guild, role_name);
    if (!role) return i.editReply("Failed to add a reaction role; invalid/non-existent role name provided.");

    let messageFetched = false;

    try {
        const msg = await i.channel.messages.fetch(message_id);
        messageFetched = true;

        const output = await rr.toggleReactionRole(message_id, reaction.id || reaction.name, role_name);
        if (output.type == "add") {
            // @ts-ignore
            await msg.react(reaction);
            await wait(1000);
            i.editReply("Successfully added a reaction role.");
        }
        else {
            await msg.reactions.resolve(reaction.id || reaction.name)?.remove();
            await wait(1000);
            i.editReply("Successfully removed a reaction role.");
        }
    }
    catch (err) {
        await wait(3000);
        if (!messageFetched) i.editReply("Failed to add a reaction role; invalid message ID provided.");
        else i.editReply("An error occurred while toggling a reaction role: " + err.stack);
    }

});