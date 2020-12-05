//A command to help promote the content of youtubers in the server (currently specialized to youtube only) [disabled]

var Command = require("../command");
var Interface = require("../interface");
var fetchVideoInfo = require("youtube-info");

//module.exports = new Command("promote", (message, args) => {

    /*var ytRole = message.member.roles.find(role => role.name == "Youtuber");
    if (!ytRole) {
        message.channel.send(`<@!${message.author.id}>, you must be a verified youtuber with the Youtuber role in order to promote your videos.`);
        return;
    }*/

    /*var video;

    let promote = new Interface.Interface(message, "Are you a verified youtuber seeking to promote one of your Zhorde videos? Enter the link to a single video below to begin:", (url, menu) => {
        if (url) {
            url = url.content;
        }
        
        if (!url) {}
        else if ((!url.match("youtube\.com\/watch\\?v=") && !url.match("youtu.be")) || !url.match("http")) {
            message.channel.send("That is not a valid youtube video URL. Make sure to include the full URL, including the http(s) portion.");
        }
        else {
            if (url.match("youtube\.com\/watch\\?v=")) {
                video = url.split("watch?v=")[1].split("&")[0];
            }
            else if (url.match("youtu.be")) {
                video = url.split("youtu.be/")[1];
            }

            try {
                fetchVideoInfo(video).then(info => {
                    let thumb = info.channelThumbnailUrl;
                    let desc = info.description.replace(/<([^<>]*)>/gm, " ");
                    let embed = new Interface.Embed(message, thumb, [
                        {
                            name: "Video Description",
                            value: `${desc.length > 190 ? desc.substring(0, 190) + "..." : desc} [Watch now!](${info.url})`
                        },
                        {
                            name: "** **",
                            value: "** **"
                        },
                        {
                            name: "Youtube Channel",
                            value: `👤 [${info.owner}](https://youtube.com/channel/${info.channelId})`,
                            inline: true
                        },
                        {
                            name: "** **",
                            value: "** **",
                            inline: true
                        },
                        {
                            name: "Total Views",
                            value: `👁️ ${info.views} views`,
                            inline: true
                        },
                        {
                            name: "Video Duration",
                            value: `⏳ ${Math.floor(info.duration / 60)} minutes and ${Math.floor(info.duration % 60)} seconds`,
                            inline: true
                        },
                        {
                            name: "** **",
                            value: "** **",
                            inline: true
                        },
                        {
                            name: "Likes Received",
                            value: `💕 ${info.likeCount} likes`,
                            inline: true
                        }
                    ]);

                    embed.embed.title = `New YT Video: ${info.title}`;
                    embed.embed["image"]["url"] = info.thumbnailUrl;
                    embed.embed.color = 16711680;

                    message.guild.channels.find(channel => channel.name == "📺media").send(embed);
                });

                menu.edit("✅ Successfully promoted your video!");
            }
            catch (err) {
                message.reply("I was unable to find that video. Are you sure you typed it in right?");
                menu.edit("<a:no_animated:670060124399730699> Failed to promote your video :(");
            }
        }

    });*/

//}, {roles: ["Youtuber"]}, false, "Promote your Youtube videos in the server.");