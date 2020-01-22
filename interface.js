var Discord;

function Interface(message, question, response, callback) {

    message.channel.send(question);
    const collector = new Discord.MessageCollector(message.channel, m => m.author.id == message.author.id, {maxMatches: 1});
    collector.on("collect", message => {
        if (message.content.toLowerCase() == response) {
            callback(message);
        }
    });

}

module.exports = {
    Interface: Interface,
    setClient: (client) => {
        Discord = client;
    }
};