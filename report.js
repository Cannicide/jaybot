//The command to report bugs, or to report players for cheating/abuse

const plrepThread = "https://zhorde.net/forums/player-reports.14/create-thread?title=Player+Report+-+ZhordeBot-Generated";
const plrepFormat = "https://zhorde.net/threads/how-to-report-a-player.875/";

var Command = require("./command");
var Interface = require("./interface");

var reportTypes = ["Players", "Bugs", "Safespots"];
var message;

var reportFunction = (choice, menu) => {
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
                let thumb;
                let bugThumb = "https://cdn.discordapp.com/attachments/668485643487412237/691701166408728676/bug.png";
                let safespotThumb = "https://cdn.discordapp.com/attachments/668485643487412237/692087177047310356/safespot.png";

                if (matchesType == "Bugs") thumb = bugThumb;
                else thumb = safespotThumb;

                //let title = new Interface.Interface(message, `Give a concise and descriptive title for your ${matchesType.toLowerCase().substring(0, matchesType.length - 1)} report (one small sentence recommended):`, (res1, init1) => {
                    //if (!res1){}
                    //else {
                        //var bugTitle = res1.content;
                        //init1.edit(`✅ Successfully entered a title for the ${matchesType.toLowerCase().substring(0, matchesType.length - 1)} report.`);

                        let desc = new Interface.Interface(message, `The ${matchesType.toLowerCase().substring(0, matchesType.length - 1)} reporting process is a **two-step process**. This means that **both of the steps must be completed** for your ${matchesType.toLowerCase().substring(0, matchesType.length - 1)} report to reach the ${matchesType == "Bugs" ? "developer" : "builder"}(s) who fix the ${matchesType.toLowerCase()}.\n\n**Step 1)**\nGive a detailed description of the ${matchesType.toLowerCase().substring(0, matchesType.length - 1)} you found, what map and arena you found it in (if applicable), and ${matchesType == "Bugs" ? "describe how to reproduce this bug if reproducable" : "whether this is a partial or full safespot"} (1-6 sentences recommended).`, (res2, init2) => {
                            if (!res2){}
                            else {
                                var bugDesc = res2.content;
                                var bugTitle = bugDesc.length < 42 ? bugDesc : bugDesc.substring(0, 42);
                                init2.edit(`✅ Successfully entered a description for the ${matchesType.toLowerCase().substring(0, matchesType.length - 1)} report.`);

                                let img = new Interface.Interface(message, "**Step 2)**\nAttach **one** image or URL illustrating the " + matchesType.toLowerCase().substring(0, matchesType.length - 1) + " that you found, or type `none` if you do not have an image/video/URL. **Image files** and **any URLs** are both accepted.", (res3, init3) => {
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

                                        init3.edit(`✅ Successfully set an image/file/URL, or a default image if one was not attached, for the ${matchesType.toLowerCase().substring(0, matchesType.length - 1)} report.`);

                                        //Now post a bug report embed to the #bugs channel
                                        let bugReport = new Interface.Embed(message, thumb, [
                                            {
                                                name: `${matchesType.toUpperCase().substring(0, 1) + matchesType.toLowerCase().substring(1, matchesType.length - 1)} Report: **${bugTitle}**`,
                                                value: bugDesc
                                            },
                                            {
                                                name: `${matchesType.toUpperCase().substring(0, 1) + matchesType.toLowerCase().substring(1, matchesType.length - 1)} Evidence`,
                                                value: `[🔗](${bugImage})`
                                            }
                                        ]);

                                        //Insert bugs to trello automagically
                                        if (matchesType == "Bugs") {

                                            var Trello = require('trello-node-api')(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN);
                                            var data = {
                                                name: bugTitle,
                                                desc: bugDesc + " [Added automatically by ZH-Bot]",
                                                pos: 'bottom',
                                                idList: process.env.BUGS_LIST, //REQUIRED
                                                due: null,
                                                dueComplete: false,
                                                idMembers: [],
                                                idLabels: [],
                                                urlSource: bugImage
                                            };

                                            Trello.card.create(data).then(function (response) {
                                                //console.log('Trello card creation response ', response);
                                            }).catch(function (error) {
                                                console.log('Trello card creation error:', error);
                                            });
                                        }

                                        bugReport.embed["image"]["url"] = bugImage.match(/\.(jpeg|jpg|gif|png)$/) ? bugImage : "";
                                        bugReport.embed.title = bugTitle;

                                        if (matchesType == "Bugs") message.guild.channels.get(message.guild.channels.find("name", "bugs").id).send(bugReport);
                                        else if (matchesType == "Safespots") message.guild.channels.get(message.guild.channels.find("name", "safespots").id).send(bugReport);
                                        message.channel.send(`✅ Your ${matchesType.toLowerCase().substring(0, matchesType.length - 1)} report has been submitted, <@!${message.author.id}>`);
                                    }
                                }, "report")
                            }
                        }, "report")
                //})
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

        if (menu) menu.edit(`✅ Report-type selection successfully completed.`);
    }
};

module.exports = new Command("report", (msg, args) => {

    var response = new Interface.FancyMessage("Report Issues", "Which of the following would you like to report?", reportTypes, {
        title: "#",
        bullet: "*"
    }).get();

    message = msg;

    if (message.channel.name.toLowerCase().match("bug")) {
        reportFunction({content: "Bugs"});
    }
    else if (message.channel.name.toLowerCase().match("safespot")) {
        reportFunction({content: "Safespots"});
    }
    else {
        var report = new Interface.Interface(msg, response, reportFunction, "report");
    }

}, false, false, "Report bugs, safespots, and players.");