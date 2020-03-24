//The command to report bugs, or to report players for cheating/abuse

const plrepThread = "https://zhorde.net/forums/player-reports.14/create-thread?title=Player+Report+-+ZhordeBot-Generated";
const plrepFormat = "https://zhorde.net/threads/how-to-report-a-player.875/";

var Command = require("./command");
var Interface = require("./interface");

module.exports = new Command("report", (message, args) => {

    var reportTypes = ["Players", "Bugs", "Safespots"];
    var response = new Interface.FancyMessage("Report Issues", "Which of the following would you like to report?", reportTypes, {
        title: "#",
        bullet: "*"
    }).get();

    var report = new Interface.Interface(message, response, (choice, menu) => {
        if (!choice) {}
        else {
            var answer = choice.content;
            var matchesType = false;

            reportTypes.forEach((item) => {
                if (item.toLowerCase() == answer.toLowerCase() || item.substring(0, item.length - 1).toLowerCase() == answer.toLowerCase()) {
                    matchesType = item;
                }
            });

            if (matchesType) {
                if (matchesType == "Bugs" || matchesType == "Safespots") {
                    //Report a bug/safespot
                    let thumb = "https://cdn.discordapp.com/attachments/668485643487412237/691701166408728676/bug.png";

                    let title = new Interface.Interface(message, "Give a concise and descriptive title for your bug/safespot report (one small sentence recommended):", (res1, init1) => {
                        if (!res1){}
                        else {
                            var bugTitle = res1.content;
                            init1.edit(`✅ Successfully entered a title for the bug report.`);

                            let desc = new Interface.Interface(message, "Now give a detailed description of the bug/safespot you found, what map and arena you found it in (if applicable), and describe whether this is a safespot or a bug in general (1-6 sentences recommended).", (res2, init2) => {
                                if (!res2){}
                                else {
                                    var bugDesc = res2.content;
                                    init2.edit(`✅ Successfully entered a description for the bug report.`);

                                    let img = new Interface.Interface(message, "Attach **one** image illustrating the bug that you found, or type `none` if you do not have an image. **Image files** and **image URLs** are both accepted.", (res3, init3) => {
                                        if (!res3){}
                                        else {
                                            var bugImage;
                                            if (res3.content.toLowerCase() == "none") {
                                                bugImage = thumb;
                                            }
                                            else if (res3.content.match("http")) {
                                                bugImage = res3.content;
                                            }
                                            else {
                                                var attachment = (res3.attachments).array();
                                                bugImage = attachment[0].url;
                                            }

                                            init3.edit(`✅ Successfully set an image, or a default image if one was not attached, for the bug report.`);

                                            //Now post a bug report embed to the #bugs channel
                                            let bugReport = new Interface.Embed(message, thumb, [
                                                {
                                                    name: `Bug Report: **${bugTitle}**`,
                                                    value: bugDesc
                                                }
                                            ]);

                                            bugReport.embed["image"]["url"] = bugImage;
                                            bugReport.embed.title = bugTitle;

                                            message.guild.channels.get(message.guild.channels.find("name", "bugs").id).send(bugReport);
                                            message.channel.send(`✅ Your bug report has been submitted, <@!${message.author.id}>`);
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
                else if (matchesType == "Players") {
                    //Report a player
                    let thumb = "https://cdn.discordapp.com/attachments/372124612647059476/431626525809573898/ZHFinal.png";
                    let embed = new Interface.Embed(message, thumb, [
                        {
                            name: "Player Report Format",
                            value: `To report a player, follow the [player report format](${plrepFormat}). Copy the template found in the post.`
                        },
                        {
                            name: "Reporting the Player",
                            value: `Create a new [player report thread](${plrepThread}) and paste the template. Provide detailed responses and solid evidence, following the format. Your report can only be seen by staff members, and they will review your report and take action as soon as possible.`
                        }
                    ]);

                    message.channel.send(embed);
                }
            }
            else {
                message.channel.send("You did not select a valid object to report. Please try again.");
            }

            menu.edit(`✅ Report-type selection successfully completed.`);
        }
    });

}, false);