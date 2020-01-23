var Discord;

/**
 * Creates a new FancyMessage, helping to make the Interface more interactive and aesthetically appealing.
 * @constructor
 * @param {String} title - Title of the FancyMessage
 * @param {String} question - Question asked to the user
 * @param {Array} bullets - List of answers that the user can respond with
 * @param {Object} [options] - Options to customize title type, and bullet type
 * @param {"="|"#"} [options.title] - Customize title type
 * @param {"*"|"-"} [options.bullet] - Customize the bullet type
 */
function FancyMessage(title, question, bullets, options) {
    options = options || {title: "=", bullet: "*"};

    if (options.title == "=") {
        var stylizedTitle = title + "\n===============================";
    }
    else {
        var stylizedTitle = "# " + title + " #";
    }

    var msg = `\`\`\`md\n${stylizedTitle}\`\`\`\n\`\`\`md\n< ${question} >\n\n`;
    var stylizedBullets = "";

    bullets.forEach((bullet) => {
        stylizedBullets += options.bullet + " " + bullet + "\n";
    });

    msg += stylizedBullets + "\n<!-- Menu will close in 30 seconds.\nDo not include punctuation or the command prefix in your response. -->\`\`\`";

    this.get = () => {return msg};

}

/**
 * Creates a new Interface, an interactive means of receiving input from the user.
 * Works fine with FancyMessage.
 * @param {Object} message - Message containing the command that led to calling on the interface
 * @param {String} question - Question to ask user for a response
 */
function Interface(message, question, callback) {

    var collected = false;
    var closed = false;
    var qMessage;
    message.channel.send(question).then((msg) => {
        qMessage = msg;
    });
    const collector = new Discord.MessageCollector(message.channel, m => m.author.id == message.author.id, {maxMatches: 1});
    collector.on("collect", msg => {
        collected = true;
        callback(msg, qMessage);
    });

    collector.on("end", () => {
        closed = true;
    });

    setTimeout(() => {
        if (closed) return;
        else if (!collected) {
            collector.stop("User did not give a response within 30 seconds");
            qMessage.edit(`<:no:669928674119778304> <@!${message.author.id}>, the menu closed because you did not respond within 30 seconds.`);
            closed = true;
            callback(false);
        }
    }, 30000);

}

module.exports = {
    Interface: Interface,
    /**
     * Sets the Discord variable to the actual Discord object from the server, in order to use MessageCollector.
     * @param {Object} client - The inputted Discord object to set the Discord variable to
     */
    setClient: (client) => {
        Discord = client;
    },
    FancyMessage: FancyMessage
};