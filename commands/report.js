//The command to report bugs, or to report players for cheating/abuse

const plrepThread = "https://zhorde.net/forums/player-reports.14/create-thread?title=Player+Report+-+ZhordeBot-Generated";
const plrepFormat = "https://zhorde.net/threads/how-to-report-a-player.875/";

var Command = require("../command");
var Interface = require("../interface");
const Interpreter = require("../interpreter");
var Reactions = require("../evg").remodel("reactions");

var reportFunction = (message, choice, menu) => {
    //Report a player
    let thumb = "https://cdn.discordapp.com/attachments/372124612647059476/431626525809573898/ZHFinal.png";
    let embed = new Interface.Embed(message, {
        thumbnail: thumb,
        fields: [
            {
                name: "Player Report Format",
                value: `To report a player, follow the [player report format](${plrepFormat}). Copy the template found in the post.`
            },
            {
                name: "Reporting the Player",
                value: `Create a new [player report thread](${plrepThread}) and paste the template. Provide detailed responses and solid evidence, following the format. Your report can only be seen by staff members, and they will review your report and take action as soon as possible.`
            }
        ]
    });

    message.channel.send(embed);
};

//Setup the bug-ticketing message (message with the reaction) for the bug ticketing system
function sendTicketingMessage(message, args) {
    //Ensure the channel is a bug reports channel before continuing
    if (!message.channel.name.toLowerCase().match("bug")) return message.channel.send("You can only do this in bug-reporting channels!");

    var cache = Reactions;
    var request = new Interface.Embed(message, {desc:"Click 🎟️ to report a bug!",title:"Bug Reports"});

    request.embed.footer = {};

    message.channel.send(request).then(m => {

        if (cache.find(c => c.type == "bug-ticket")) cache.splice(cache.values().findIndex(c => c.type == "bug-ticket"));

        var item = {
            name: "🎟️",
            id: "ticket-emoji",
            type: "bug-ticket",
            messageID: m.id,
            channelID: m.channel.id
        };

        message.interpreter.addReaction([item.name], item)
      
        m.react("🎟️");
        message.delete();

    });
    
}

//Handle the ticketing process on user reaction
function handleTicketing(message, user) {

    //Fetch current channel permission overwrites
    var overwrites = message.channel.permissionOverwrites.array();

    if (overwrites.find(o => o.id == user.id)) return overwrites.splice(overwrites.findIndex(o => o.id == user.id), 1);

    overwrites.push({
        id: user.id,
        allow: ['SEND_MESSAGES'],
    })

    //Create request message
    var request = new Interface.Embed({guild:true,author:user,member:message.guild.member(user.id),client:message.client}, {desc:"Thank you for opening a ticket, please describe your bug in two or less messages below.\nAttach an image/link to include it in the report.\nYour report will automatically be saved to a hidden channel.\n\nClick 📨 to submit your report!",title:"Bug Ticket"});

    //Establish collector
    var collector;

    //Send request for bug ticket
    message.channel.send(request).then(m => {
        request = m;
        m.react("📨");

        var reactor = m.createReactionCollector((reaction, tuser) => reaction.emoji.name == "📨" && tuser.id == user.id, {time: 4.5 * 60 * 1000});
        reactor.on('collect', r => {
            collector.stop();
        });
    });

    //Give permissions to send messages in channel
    message.channel.overwritePermissions(overwrites, 'Member is using Bug Ticketing System.');

    collector = message.channel.createMessageCollector(m => m.author.id == user.id, {max: 2, time: 5 * 60 * 1000});
    collector.on("end", (collected) => {
        if (collected.size == 0) {
            //User did not respond in time
            message.channel.send(`<a:no_animated:670060124399730699> <@!${user.id}>, you did not respond within 5 minutes. **Failed to report your bug.** Please follow the instructions in the given time to report the bug properly.`)
            .then(m => {

                //Auto-delete error message after 10 seconds.
                setTimeout(() => {
                    m.delete();
                }, 10 * 1000)

            });
        }
        else {
            //User did respond with 1-2 messages, combine all of them into a bug report.

            var evidence = false;
            var bugDesc = "";
            var bugTitle = "";

            var firstTitle = "";
            var secondTitle = "";

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
                        evidence = bugImage;
                        needsCustomURL = true;

                        m.client.guilds.cache.get("668485643487412234").channels.cache.get("728320173009797190").send({files: [
                            evidence
                        ]}).then(imageMsg => {
                            
                            evidence = (imageMsg.attachments).array()[0].url;
                            m.delete({reason:"Message collection for Bug Ticketing System."});
                        });
                    }
                    else if (bugImage == orig && (!evidence || evidence == orig)) evidence = orig;

                }

                //Build description from individual messages

                if (bugDesc.length != 0) {
                    firstTitle = bugDesc;
                    bugTitle = firstTitle;
                    bugDesc += "\n";
                }

                bugDesc += m.content;
                secondTitle = bugDesc;

                //Delete individual messages
                if (!needsCustomURL) m.delete({reason:"Message collection for Bug Ticketing System."});

            });

            //2.5 second timeout to allow for uploading of evidence to CannicideAPI
            setTimeout(() => {

                //Build title
                bugTitle = firstTitle.replace(/etc./gi, "%aed%").split(". ")[0].replace(/\%aed\%/gi, "etc.") + ".";

                if (bugTitle == ".") {
                    bugTitle = secondTitle.replace(/etc./gi, "%aed%").split(". ")[0].replace(/\%aed\%/gi, "etc.") + ".";

                    if (bugTitle == ".") bugTitle = "Bug Report";
                }

                if (bugTitle.endsWith("..")) bugTitle = bugTitle.substring(0, bugTitle.length - 1);

                //Now create a bug report embed to be posted to the #bugs channel
                let bugReport = new Interface.Embed({guild:true,author:user,member:message.guild.member(user.id),client:message.client}, {
                    thumbnail: orig,
                    fields: [
                        {
                            name: `Bug Description`,
                            value: bugDesc
                        },
                        {
                            name: `Bug Evidence`,
                            value: `[🔗](${evidence})`
                        }
                    ],
                    image: evidence.match(/\.(jpeg|jpg|gif|png)$/) ? evidence : "",
                    video: !evidence.match(/\.(jpeg|jpg|gif|png)$/) ? evidence : "",
                    title: bugTitle
                });

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

            }, 2500);

            //Send thank you message for reporting bug, and delete after 5 seconds
            message.channel.send(new Interface.Embed({guild:true,author:user,member:message.guild.member(user.id),client:message.client}, {desc:"Your bug report has been submitted! Thank you for submitting a ticket."}))
            .then(thanks => {
                setTimeout(() => {
                    thanks.delete();
                }, 5000)
            });

        }

        //Delete the request message
        request.delete();

        //Remove the user's perms to send messages in channel
        overwrites.splice(overwrites.findIndex(o => o.id == user.id), 1);
        message.channel.overwritePermissions(overwrites, 'Member has finished using Bug Ticketing System.');

    });

}

module.exports = {
    commands: [new Command("report", {
        desc: "Report bugs, safespots, and players."
    }, (msg) => {

        //Only handle player reporting
        reportFunction(msg);

    }),
    new Command("ticketer", {
        roles: ["Admin", "Developer", "Bot Dev", "System Administrator", "Manager", "Owner"],
        desc: "Admin-only tool to generate our bug-ticketing system."
    }, (msg) => {

        sendTicketingMessage(msg, msg.args);

    })],
    ticket: handleTicketing,
    initialize: function() {
        //Setup bug ticketing reaction
        Interpreter.register({
            type: "reaction",
            filter: (inCache, isAdding) => inCache.type == "bug-ticket" && isAdding,
            response: (r, u) => {
                
                //Remove the users' reaction if not a bot
                r.users.cache.array().forEach((user) => {
                    if (user.bot) return;
                    r.users.remove(user);
                });
              
                this.ticket(r.message, u);
            }
        });
    }
}