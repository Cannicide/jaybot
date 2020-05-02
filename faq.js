var Command = require("./command");
var Interface = require("./interface")

module.exports = new Command("faq", (message, args) => {

    var faqTopics = ["Gold", "Ranks", "Zombies", "XP", "Perks", "Kits"];

    var response = new Interface.FancyMessage("Frequently Asked Questions", "Which topic would you like to view?", faqTopics, {
        title: "=",
        bullet: "*"
    }).get();

    var faq = new Interface.Interface(message, response, (choice, menu) => {
        if (!choice) {
            //Do nothing, error message will already have been sent
        }
        else {
            var answer = choice.content;
            var matchesTopic = false;
            faqTopics.forEach((item) => {
                if (item.toLowerCase() == answer.toLowerCase()) {
                    matchesTopic = item;
                }
            });

            if (matchesTopic) {
                message.channel.send("Once at this point, show the user the FAQ for the topic: " + matchesTopic);
            }
            else {
                message.channel.send("User did not select any valid topic, so scold and admonish them, respectfully.");
            }

            menu.edit(`✅ FAQ topic selection successfully completed.`);
        }
    });

}, false, false, "View the most frequently asked questions, and their answers.");