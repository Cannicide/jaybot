const { createEvent, Discord, postTrello, wait } = require("../panacea");

createEvent({
    name: "threadCreate",
    handler: async (thread, wasCreated) => {
        if (!wasCreated) return;
        if (thread?.parent?.type != Discord.ChannelType.GuildForum) return;
        if (!thread.parent.name?.replace(/ /g, "-")?.match("bug-reports")) return;
        // If above conditions pass, a bug forum post has been created

        await wait(500);

        try {
            const msg = await thread.fetchStarterMessage();
            const creator = await thread.fetchOwner();
            const tags = thread.appliedTags;
            const labels = {
                "default": "64861391e293aa9631cb1714", // Default (low priority) tag
                "1117283805544321000": "64861391e293aa9631cb1714", // Low priority tag
                "1117283744974389319": "648613a48b949f9bd42715b4", // Medium priority tag
                "1117283698606362654": "648613b2fdf52010295e8633" // High priority tag
            };

            // Trello Card field data:
            const title = thread.name;
            const desc = `${msg?.content || "No description provided."}\n\n---\n\nAutomatically Added By Panacea\nReported By: ${creator?.user?.username ?? "Unknown User"}\n\n---`;
            const image = msg.attachments.first()?.url;
            const label = labels[tags?.[0]] ?? labels["default"];

            // Card field data compiled into object:
            const card = {
                title,
                desc,
                image,
                label
            };

            postTrello(card);
        }
        catch (err) {
            console.log("Error occurred during Trello-bug beaming: " + err.message);
        }
    }
})