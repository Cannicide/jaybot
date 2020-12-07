//The command to report bugs, or to report players for cheating/abuse

const plrepThread = "https://zhorde.net/forums/player-reports.14/create-thread?title=Player+Report+-+ZhordeBot-Generated";
const plrepFormat = "https://zhorde.net/threads/how-to-report-a-player.875/";

var Command = require("../command");
var Interface = require("../interface");
var Reactions = new (require("../evg"))("reactions");
var fetch = require("node-fetch");

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

            if (matchesType == "Bugs") return message.channel.send("Reporting bugs in this method is no longer supported, please use the ticketing system.");

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
                                //var bugTitle = bugDesc.length < 42 ? bugDesc : bugDesc.substring(0, 42);
                                //var bugTitle = in_a.nutshell(bugDesc + ".", 1); //Summarizes bug description in one sentence using artificial intelligence (not 100% accurate)
                                var bugTitle = bugDesc.replace(/etc./gi, "%aed%").split(". ")[0].replace(/\%aed\%/gi, "etc.") + ".";
                                if (bugTitle.endsWith("..")) bugTitle = bugTitle.substring(0, bugTitle.length - 1);
                                
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
                                            bugImage = attachment[0] ? attachment[0].url : thumb;
                                        }

                                        init3.edit(`✅ Successfully set an image/file/URL, or a default image if one was not attached, for the ${matchesType.toLowerCase().substring(0, matchesType.length - 1)} report.`);

                                        //Now post a bug report embed to the #bugs channel
                                        let bugReport = new Interface.Embed(message, thumb, [
                                            {
                                                name: `${matchesType.toUpperCase().substring(0, 1) + matchesType.toLowerCase().substring(1, matchesType.length - 1)} Description`,
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
                                                desc: bugDesc + ` [Reported by ${message.author.tag}]`,
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

                                        if (matchesType == "Bugs") message.guild.channels.cache.get(message.guild.channels.cache.find(c => c.name == "bugs").id).send(bugReport);
                                        else if (matchesType == "Safespots") message.guild.channels.cache.get(message.guild.channels.cache.find(c => c.name == "safespots").id).send(bugReport);
                                        message.channel.send(`✅ Your ${matchesType.toLowerCase().substring(0, matchesType.length - 1)} report has been submitted, <@!${message.author.id}>`);
                                    }
                                }, "report." + matchesType.toLowerCase().substring(0, matchesType.length - 1))
                            }
                        }, "report." + matchesType.toLowerCase().substring(0, matchesType.length - 1))
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

//The oversimplified Bug: bug-reporting system
function bugcolon(message, args, matchesType) {

    //Bugs can only be reported via ticketing system now
    if (matchesType == "Bugs") return message.channel.send("Reporting bugs in this method is no longer supported, please use the ticketing system.");

    var orig = "https://cdn.discordapp.com/attachments/668485643487412237/691701166408728676/bug.png";
    var bugImage = orig;

    if (message.content.match("http")) {
        bugImage = args.find(m => m.match("http"));
    }
    else {
        var attachment = (message.attachments).array();
        bugImage = attachment[0] ? attachment[0].url : orig;
    }

    var nonargs = args;
    nonargs.shift();

    var bugDesc = nonargs.join(" ");
    var bugTitle = bugDesc.replace(/etc./gi, "%aed%").split(". ")[0].replace(/\%aed\%/gi, "etc.") + ".";
    if (bugTitle.endsWith("..")) bugTitle = bugTitle.substring(0, bugTitle.length - 1);

    //Now post a bug report embed to the #bugs channel
    let bugReport = new Interface.Embed(message, orig, [
        {
            name: `${matchesType.toUpperCase().substring(0, 1) + matchesType.toLowerCase().substring(1, matchesType.length - 1)} Description`,
            value: bugDesc
        },
        {
            name: `${matchesType.toUpperCase().substring(0, 1) + matchesType.toLowerCase().substring(1, matchesType.length - 1)} Evidence`,
            value: `[🔗](${bugImage})`
        }
    ]);

    bugReport.embed["image"]["url"] = bugImage.match(/\.(jpeg|jpg|gif|png)$/) ? bugImage : "";
    bugReport.embed.title = bugTitle;

    //Insert bugs to trello automagically
    if (matchesType == "Bugs") {

        var Trello = require('trello-node-api')(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN);
        var data = {
            name: bugTitle,
            desc: bugDesc + ` [Reported by ${message.author.tag}]`,
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

    if (matchesType == "Bugs") message.guild.channels.cache.get(message.guild.channels.cache.find(c => c.name == "bugs").id).send(bugReport);
    else if (matchesType == "Safespots") message.guild.channels.cache.get(message.guild.channels.cache.find(c => c.name == "safespots").id).send(bugReport);
    message.channel.send(`✅ Your ${matchesType.toLowerCase().substring(0, matchesType.length - 1)} report has been submitted, <@!${message.author.id}>.\n${bugImage == orig ? "No image/video evidence was found attached to your report. You can attach evidence by attaching an image on the same message as the report, or by including a link to the evidence anywhere in your report." : ""}`);
    message.react("✅");

}

//Setup the bug-ticketing message (message with the reaction) for the bug ticketing system
function sendTicketingMessage(message, args) {
    //Ensure the channel is a bug reports channel before continuing
    if (!message.channel.name.toLowerCase().match("bug")) return message.channel.send("You can only do this in bug-reporting channels!");

    var cache = Reactions.get();
    var request = new Interface.Embed(message, false, [], "Click 🎟️ to report a bug!");

    request.embed.author = {}
    request.embed.title = "Bug Reports";

    message.channel.send(request).then(m => {

        if (cache.find(c => c.type == "bug-ticket")) cache.splice(cache.findIndex(c => c.type == "bug-ticket"), 1);

        cache.push({
            name: "🎟️",
            id: "ticket-emoji",
            type: "bug-ticket",
            messageID: m.id,
            channelID: m.channel.id
        });

        m.react("🎟️");
        Reactions.set(cache);

        message.delete();

    });
    
}

//Handle the ticketing process on user reaction
function handleTicketing(message, user) {
    var request = new Interface.Embed({author:{id:user.id},client:message.client}, false, [], "Thank you for opening a ticket, please describe your bug in two or less messages below.\nYour report will automatically be saved to a hidden channel **after 5 minutes**.\nAttach an image/link to one of your messages to include it in the report.");
    request.embed.title = "Bug Ticket";

    //Send request for bug ticket
    message.channel.send(request).then(m => request = m);

    //Fetch current channel permission overwrites
    var overwrites = message.channel.permissionOverwrites.array();

    if (overwrites.find(o => o.id == user.id)) overwrites.splice(overwrites.findIndex(o => o.id == user.id), 1);

    overwrites.push({
        id: user.id,
        allow: ['SEND_MESSAGES'],
    })

    //Give permissions to send messages in channel
    message.channel.overwritePermissions(overwrites, 'Member is using Bug Ticketing System.');

    var collector = message.channel.createMessageCollector(m => m.author.id == user.id, {max: 2, time: 5 * 60 * 1000});
    collector.on("end", (collected) => {
        if (collected.size == 0) {
            //User did not respond in time
            message.channel.send(`<a:no_animated:670060124399730699> <@!${user.id}>, you did not respond within 5 minutes. **Failed to report your bug.** Please follow the instructions in the given time to report the bug properly.`);
        }
        else {
            //User did respond with 1-2 messages, combine all of them into a bug report.

            var evidence = false;
            var bugDesc = "";
            var bugTitle = "";

            var orig = "https://cdn.discordapp.com/attachments/668485643487412237/691701166408728676/bug.png";

            collected.array().forEach((m) => {

                //Fetch evidence from individual messages

                var bugImage = orig;
                var args = m.content.split(" ");
                var needsCustomURL = false;

                if (m.content.match("http")) {
                    bugImage = args.find(msg => msg.match("http"));
                    if (!evidence) evidence = bugImage;
                }
                else {
                    var attachment = (m.attachments).array();
                    bugImage = attachment[0] ? attachment[0].url : orig;

                    if (bugImage != orig && (!evidence || evidence == orig)) {
                        var url = `https://cannicideapi.glitch.me/upload/000000000000000000/?url=${bugImage}`;
                        needsCustomURL = true;

                        fetch(url).then(res => res.text())
                        .then(body => {
                            evidence = body;
                            m.delete({reason:"Message collection for Bug Ticketing System."});
                        })
                    }
                    else if (bugImage == orig && (!evidence || evidence == orig)) evidence = orig;

                }

                //Build description from individual messages

                if (bugDesc.length != 0) {
                    bugTitle = bugDesc;
                    bugDesc += "\n";
                }

                bugDesc += m.content;

                //Delete individual messages
                if (!needsCustomURL) m.delete({reason:"Message collection for Bug Ticketing System."});

            });

            //5 second timeout to allow for uploading of evidence to CannicideAPI
            setTimeout(() => {

                //Build title
                bugTitle = bugTitle.replace(/etc./gi, "%aed%").split(". ")[0].replace(/\%aed\%/gi, "etc.") + ".";
                if (bugTitle.endsWith("..")) bugTitle = bugTitle.substring(0, bugTitle.length - 1);

                //Now create a bug report embed to be posted to the #bugs channel
                let bugReport = new Interface.Embed(message, orig, [
                    {
                        name: `Bug Description`,
                        value: bugDesc
                    },
                    {
                        name: `Bug Evidence`,
                        value: `[🔗](${evidence})`
                    }
                ]);

                bugReport.embed["image"]["url"] = evidence.match(/\.(jpeg|jpg|gif|png)$/) ? evidence : "";
                bugReport.embed.title = bugTitle;

                //Send the bug report embed to #bugs
                message.guild.channels.cache.get(message.guild.channels.cache.find(c => c.name == "bugs").id).send(bugReport);

                //Post the bug to our trello automagically
                var Trello = require('trello-node-api')(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN);
                var data = {
                    name: bugTitle,
                    desc: bugDesc + ` [Reported by ${user.tag}]`,
                    pos: 'bottom',
                    idList: process.env.BUGS_LIST, //REQUIRED
                    due: null,
                    dueComplete: false,
                    idMembers: [],
                    idLabels: [],
                    urlSource: evidence
                };

                Trello.card.create(data).then(function (response) {
                    //console.log('Trello card creation response ', response);
                }).catch(function (error) {
                    console.log('Trello card creation error:', error);
                });

            }, 15000);

        }

        //Delete the request message
        request.delete();

        //Remove the user's perms to send messages in channel
        overwrites.splice(overwrites.findIndex(o => o.id == user.id), 1);
        message.channel.overwritePermissions(overwrites, 'Member has finished using Bug Ticketing System.');

        //Send thank you message for reporting bug, and delete after 5 seconds
        message.channel.send(new Interface.Embed({author:{id:user.id},client:message.client}, false, [], "Your bug report has been submitted! Thank you for submitting a ticket."))
        .then(thanks => {
            setTimeout(() => {
                thanks.delete();
            }, 5000)
        });

    });

}

module.exports = {
    commands: [new Command("report", (msg, args) => {

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
            var report = new Interface.Interface(msg, response, reportFunction, "report.issue");
        }

    }, false, false, "Report bugs, safespots, and players."),
    new Command("ticketer", (msg, args) => {

        sendTicketingMessage(msg, args);

    }, {perms:["ADMINISTRATOR"]}, false, "Admin-only tool to generate our bug-ticketing system.")],
    colon: bugcolon,
    ticket: handleTicketing
}