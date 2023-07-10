const Vidar = require("djs-vidar");
const { wait, db } = require("../panacea");
const { statsSave, statsDisplay } = require("../systems/stats");

Vidar.command("statsadmin", "Sets a category to display statistics in.")
.argument("<category_id>")
.require("Administrator")
.action(async i => {
    await i.deferReply({ ephemeral: true });
    const { category_id } = Vidar.args(i);

    try {
        const category = await i.guild.channels.fetch(category_id);
        if (!category) return i.editReply("Failed to find a valid category channel with that ID.");

        await statsSave(i.client);
        await db.StatCategory.destroy({
            where: { isDestroyable: true }
        });

        await wait(1000);
        await db.StatCategory.create({ categoryId: category.id });

        // await wait(2000);
        await statsDisplay(i.client, true);

        i.editReply("Successfully added statistics to the provided category channel.");
    }
    catch (err) {
        await wait(1000);
        i.editReply(`Failed to add statistics to the provided category channel; an error occurred: ${err.message}.`);
    }
});