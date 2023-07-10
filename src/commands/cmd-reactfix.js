const Vidar = require("djs-vidar");
const { wait } = require("../panacea");

Vidar.command("yeanay", "Adds a yea-nay vote to a specified message.")
.argument("<message>")
.require("Administrator")
.action(async i => {
    await i.deferReply({ ephemeral: true });

    const { message } = Vidar.args(i);

    try {
        const msg = await i.channel.messages.fetch(message);

        await msg.react("713053971757006950");
        await msg.react("713053971211878452");

        await wait(1000);
        i.editReply("Successfully added a reaction vote to the message.");
    }
    catch (err) {
        await wait(1000);
        i.editReply("Failed to add a reaction vote; the message-ID may be invalid.");
    }
});