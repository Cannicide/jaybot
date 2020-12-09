//Command to create polls and votes.

var Command = require("../command");
var Alias = require("../alias");
var Interface = require("../interface");
var Reactions = new (require("../evg"))("reactions");

const emotes = {
    mc: ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯"],
    yn: ["713053971757006950", "713053971211878452"],
    full: {
        mc: ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯"],
        yn: ["<:yea:713053971757006950>", "<:nay:713053971211878452>"]
    },
    gui: {
        yn: "785989202387009567",
        mc: "🔠",
        numbers: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]
    }
}

//Helper methods for polls
const polls = {
    add: (message, question, choices, maxChoices, type, user) => {
        //Save poll data to reactions.json
        var cache = Reactions.get();

        var item = {
            name: "",
            id: "",
            type: "poll",
            votes: {},
            voters: {},
            voteLimit: maxChoices || 1,
            question: question,
            choices: choices,
            messageID: message.id,
            channelID: message.channel.id,
            starter: user.id
        };

        if (type == "mc") {
            item.name = emotes.mc;

            if (choices.length > 10) {message.channel.send("Multiple-choice polls can only have a maximum of ten choices."); return false};
        }
        else if (type == "yn") {
            item.id = emotes.yn;

            if (choices.length > 2) {message.channel.send("Yea/nay polls can only have a maximum of two choices."); return false};
        }

        var choicesAdded = 0;
        emotes[type].forEach(choice => {
            if (choicesAdded < choices.length) {
                item.votes[choice] = 0;
                choicesAdded++;
            }
        });

        cache.push(item);
        Reactions.set(cache);

        return true;

    },
    remove: (sorted_index) => {
        //Remove poll data from reactions.json
        var cache = Reactions.get();

        var index = polls.findIndex(sorted_index);
        cache.splice(index, 1);

        Reactions.set(cache);
    },
    array: () => {
        //Get an array of all polls, in order
        var cache = Reactions.get();

        var polls_list = cache.filter(item => item.type == "poll");
        return polls_list;
    },
    fetch: (sorted_index) => {
        //Gets a specific poll based on the poll's index in polls#array()

        var sorted = polls.array();
        return sorted[sorted_index];
    },
    findIndex: (sorted_index) => {
        //Retrieves the index of a specific poll in the cache

        var cache = Reactions.get();
        var messageID = polls.fetch(sorted_index).messageID;

        var index = cache.findIndex(item => item.messageID == messageID);
        return index;
    },
    findSortedIndex: (messageID) => {
        //Retrieve a poll's index in polls#array() based on the message ID

        var sorted = polls.array();
        return sorted.findIndex(item => item.messageID == messageID);
    },
    votes: {
        add: (sorted_index, choice, user, reaction) => {
            //Adds a vote to the specified poll
            var cache = Reactions.get();
            var index = polls.findIndex(sorted_index);

            cache[index].votes[choice] += 1;

            //Add user to voters list with one vote if not present, or increment user's votes if present
            if (user.id in cache[index].voters) cache[index].voters[user.id] += 1;
            else cache[index].voters[user.id] = 1;

            //If user's votes is higher than vote limit, remove excess votes
            if (cache[index].voters[user.id] > cache[index].voteLimit) {
                reaction.users.remove(user);
            }

            Reactions.set(cache);
        },
        remove: (sorted_index, choice, user) => {
            //Removes a vote from the specified poll
            var cache = Reactions.get();
            var index = polls.findIndex(sorted_index);

            cache[index].votes[choice] -= 1;

            if (cache[index].voters[user.id] > 1) cache[index].voters[user.id] -= 1;
            else delete cache[index].voters[user.id];

            if (cache[index].votes[choice] < 1) cache[index].votes[choice] = 0;

            Reactions.set(cache);
        }
    }
}

function createPoll(message, args) {
    //Create a poll message and saves data to reactions.json

    //Check to make sure there aren't more than 10 maximum polls running at once
    //Admins can bypass this restriction
    if (polls.array().length >= 10 && !message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("Apologies, but there can only be a maximum of 10 polls running at once.").then(m => m.delete({timeout: 5000}));

    //Get the args of the message (separated by pipe char)
    args = args.join(" ").split(" | ");

    //Check how many args the message has --
    //If it has 2 (just the question and choices supplied), then create an interface to get rest of info
    //If it has all necessary args, create the poll
    //If it has no args, explain how to create a poll

    if (args && args != "" && args.length == 2) {
        //Create reaction interfaces asking for: poll-type (if only two choices) OR max choices per user (if > 2 choices)

        //Set each variable to its respective value
        var type;
        var question = args[0];
        var choices = args[1].split(", ");
        var maxChoices;

        //Poll creation functionality, after all info is supplied
        function generatePoll() {
            var previous = false;

            var formattedChoices = "";
            choices.forEach((item, index) => {
                formattedChoices += `${emotes.full[type][index]} ${item}\n`;
            });

            var embed = new Interface.Embed(message, false, [], formattedChoices);
            embed.embed.title = question;

            message.channel.send(embed).then(m => {
                //React with an emote for each choice, depending on the poll-type
                choices.forEach((choice, index) => {
                    if (previous) previous = previous.then(r => {return m.react(emotes[type][index])});
                    else previous = m.react(emotes[type][index]);
                });

                //Create poll using polls.add()
                var result = polls.add(m, question, choices, maxChoices, type, message.author);

                //Auto-delete poll message after a few seconds for aesthetic.
                message.delete({timeout: 2500})

                //Check if polls.add() returns true; if it doesn't, delete the poll message (m)
                if (!result) m.delete();
            });
        }

        //Check how many choices the poll will have
        if (choices.length > 10) args = false;
        else if (choices.length == 2) {
            //Could be yea/nay OR multiple choice, but the maxChoices will always be 1
            //So ask for poll-type

            maxChoices = 1;
            var instances = 0;

            var embedded = new Interface.Embed(message, false, [], `<:yeanay:${emotes.gui.yn}> Yea/Nay Poll\n${emotes.gui.mc} Multiple Choice Poll`);
            embedded.embed.title = "Select a Poll Type";

            new Interface.ReactionInterface(message, embedded, [emotes.gui.yn, emotes.gui.mc], (menu, reaction) => {

                if (instances >= 1) return;
                instances++;

                if (reaction.emoji.id == emotes.gui.yn) {
                    //Chose yea/nay
                    type = "yn";
                }
                else {
                    //Chose multiple choice
                    type = "mc";
                }

                menu.delete();

                if (choices.length > 10) {
                    //Error message
                    var embed = new Interface.Embed(message, false, [

                        {
                            name: "The Q&A Method",
                            value: "Specify only the poll's question and choices.\n\nFormat: ```\n/poll create <Question> | <Choice 1, Choice 2, etc.>```Ex: ```fix\n/poll create What is your favorite fruit? | Apples, Pears, Bananas```"
                        },
                        {
                            name: "The Full Method",
                            value: "Specify the poll-type (yea/nay or multiple choice), question, choices, and (optional) max-choices-per-user.\n\nFormat: ```\n/poll create <yn OR mc> | <Question> | <Choice 1, Choice 2, etc.> | [max-choices]```Ex: ```fix\n/poll create yn | Do you like apples? | I love apples, I hate apples | 1```"
                        }
            
                    ], "There are two methods of creating a poll. If you attempted to create a poll and are seeing this message, you attempted one of these methods incorrectly. See below for explanations and examples.");
            
                    embed.embed.title = "Poll Creation";
                    message.channel.send(embed);
                }
                else generatePoll();

            });
        }
        else {
            //Can only be multiple choice (more than 2 choices provided), so maxChoices could possibly be higher than 1
            //So ask for maxChoices

            type = "mc";
            var instances = 0;
            var sliceNumbers = emotes.gui.numbers.slice(0, choices.length);

            var embedded = new Interface.Embed(message, false, [], `From ${emotes.gui.numbers[0]} - ${emotes.gui.numbers[sliceNumbers.length - 1]} choices.`);
            embedded.embed.title = "Select Max Votable Choices Per User";

            new Interface.ReactionInterface(message, embedded, sliceNumbers, (menu, reaction) => {

                if (instances >= 1) return;
                instances++;

                maxChoices = emotes.gui.numbers.indexOf(reaction.emoji.name) + 1;

                menu.delete();
                
                if (choices.length > 10) {
                    //Error message
                    var embed = new Interface.Embed(message, false, [

                        {
                            name: "The Q&A Method",
                            value: "Specify only the poll's question and choices.\n\nFormat: ```\n/poll create <Question> | <Choice 1, Choice 2, etc.>```Ex: ```fix\n/poll create What is your favorite fruit? | Apples, Pears, Bananas```"
                        },
                        {
                            name: "The Full Method",
                            value: "Specify the poll-type (yea/nay or multiple choice), question, choices, and (optional) max-choices-per-user.\n\nFormat: ```\n/poll create <yn OR mc> | <Question> | <Choice 1, Choice 2, etc.> | [max-choices]```Ex: ```fix\n/poll create yn | Do you like apples? | I love apples, I hate apples | 1```"
                        }
            
                    ], "There are two methods of creating a poll. If you attempted to create a poll and are seeing this message, you attempted one of these methods incorrectly. See below for explanations and examples.");
            
                    embed.embed.title = "Poll Creation";
                    message.channel.send(embed);
                }
                else generatePoll();

            })
        }

    }
    else if (args && args.length >= 3) {
        //Create poll using poll-type, question, and choices info. Use max choices per user if provided (it's optional).

        //Set each variable to its respective value
        var type = args[0];
        var question = args[1];
        var choices = args[2].split(", ");
        var maxChoices = args[3] || 1;

        //Determine type:
        if (type == "y/n" || type == "yea/nay") type = "yn";
        if (type == "multiple choice") type = "mc";

        if (type == "yn") maxChoices = 1;
        if (maxChoices > choices.length) maxChoices = choices.length;

        //Check to make sure poll-type is valid. If not, set args to false such that the explanation message is triggered
        if (type != "yn" && type != "mc") {
            //Invalid type
            args = false;
        }
        else if ((type == "yn" && choices.length > 2) || (type == "mc" && choices.length > 10)) {
            //Invalid amount of choices
            args = false;
        }
        else {
            //Valid type

            var previous = false;

            var formattedChoices = "";
            choices.forEach((item, index) => {
                formattedChoices += `${emotes.full[type][index]} ${item}\n`;
            });

            var embed = new Interface.Embed(message, false, [], formattedChoices);
            embed.embed.title = question;

            message.channel.send(embed).then(m => {
                //React with an emote for each choice, depending on the poll-type
                choices.forEach((choice, index) => {
                    if (previous) previous = previous.then(r => {return m.react(emotes[type][index])});
                    else previous = m.react(emotes[type][index]);
                });

                //Create poll using polls.add()
                var result = polls.add(m, question, choices, maxChoices, type, message.author);

                //Auto-delete poll message after a few seconds for aesthetic.
                message.delete({timeout: 2500})

                //Check if polls.add() returns true; if it doesn't, delete the poll message (m)
                if (!result) m.delete();
            });
        }
    }

    if (!args || args == "" || args.length < 2) {
        //Explain both ways of how to create a poll -- specifying all args or just specifying the question/choices

        var embed = new Interface.Embed(message, false, [

            {
                name: "The Q&A Method",
                value: "Specify only the poll's question and choices.\n\nFormat: ```\n/poll create <Question> | <Choice 1, Choice 2, etc.>```Ex: ```fix\n/poll create What is your favorite fruit? | Apples, Pears, Bananas```"
            },
            {
                name: "The Full Method",
                value: "Specify the poll-type (yea/nay or multiple choice), question, choices, and (optional) max-choices-per-user.\n\nFormat: ```\n/poll create <yn OR mc> | <Question> | <Choice 1, Choice 2, etc.> | [max-choices]```Ex: ```fix\n/poll create yn | Do you like apples? | I love apples, I hate apples | 1```"
            }

        ], "There are two methods of creating a poll. If you attempted to create a poll and are seeing this message, you attempted one of these methods incorrectly. See below for explanations and examples.");

        embed.embed.title = "Poll Creation";
        message.channel.send(embed);
    }

}

function handleAddVote(reaction, user) {
    //Handle votes by saving vote data to reactions.json and ensuring that max choices per user is not exceeded

    //Find sorted index of the current poll
    var index = polls.findSortedIndex(reaction.message.id);

    //Check if reaction's ID is present in emotes.yn[], to determine the poll type
    if (emotes.yn.includes(reaction.emoji.id)) {
        //Is yea/nay

        polls.votes.add(index, reaction.emoji.id, user, reaction);
    }
    else {
        //Is multiple-choice

        polls.votes.add(index, reaction.emoji.name, user, reaction);
    }

}

function handleRetractVote(reaction, user) {
    //Handle votes by saving vote data to reactions.json and ensuring that max choices per user is not exceeded

    //Find sorted index of the current poll
    var index = polls.findSortedIndex(reaction.message.id);

    //Check if reaction's ID is present in emotes.yn[], to determine the poll type
    if (emotes.yn.includes(reaction.emoji.id)) {
        //Is yea/nay

        polls.votes.remove(index, reaction.emoji.id, user);
    }
    else {
        //Is multiple-choice

        polls.votes.remove(index, reaction.emoji.name, user);
    }

}

function pollProgress(message, args) {
    //Show the current and/or final results of a poll by its sorted_index

    //Get sorted_index from args
    var index = args && args.length == 1 ? args[0] : false;

    if (index && !isNaN(index) && Number(index) < polls.array().length && Number(index) >= 0) {
        //An index was properly specified

        var poll = polls.fetch(index);
        var votes = poll.votes;

        var choices = Object.keys(votes);
        var type = emotes.yn[0] == poll.id[0] ? "yn" : "mc";
        var response = "";

            var choice = "No votes are in";
            var maxVotes = 0;

            Object.keys(votes).forEach((key, index) => {
                if (votes[key] > maxVotes) {
                    choice = `${emotes.full[type][index]} (**${poll.choices[index]}**)`;
                    maxVotes = votes[key];
                }
                else if (votes[key] == maxVotes) {
                    choice += ", " + `${emotes.full[type][index]} (**${poll.choices[index]}**)`;
                }
            });

        response = `Leading: ${choice}\n\n`;

        choices.forEach((choice, index) => {
            response += `${emotes.full[type][index]} (${poll.choices[index]}): ${votes[choice]} votes\n`;
        });

        var embed = new Interface.Embed(message, false, [{
            name: "Votes",
            value: response
        }], "");
        embed.embed.title = poll.question;

        message.channel.send(embed);

    }
    else {
        //An index was not properly specified

        message.delete({timeout: 5000});
        message.channel.send("Invalid poll index. Please specify a poll using the number index listed to the left of each poll in `/polls list`.").then(m => m.delete({timeout: 10000}));
    }

}

function listPolls(message) {
    //List all of the current polls (by their sorted_index) - no need for guild checks since only one guild is being used

    var list = polls.array();
    var response = "";

    list.forEach((poll, index) => {
        response += `**[${index}]** ${poll.question}\n`;
    });

    if (response == "") response = "No polls are currently running.";

    var embed = new Interface.Embed(message, false, [], response);
    embed.embed.title = "Poll List";

    message.channel.send(embed);

}

function endPoll(message, args) {
    //Ends a specified poll using its sorted_index

    //Get sorted_index from args
    var index = args && args.length == 1 ? args[0] : false;

    if (index && !isNaN(index) && Number(index) < polls.array().length && Number(index) >= 0) {
        //An index was properly specified

        if (polls.fetch(index).starter != message.author.id && !message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(`Sorry <!@${message.author.id}>, you do not have permission to end that poll.`).then(m => m.delete({timeout: 5000}));

        var id = polls.fetch(index).messageID;
        var channelID = polls.fetch(index).channelID;

        message.guild.channels.cache.get(channelID).messages.fetch(id).then(m => {

            var opts = polls.fetch(index).votes;
            var choice = "";
            var maxVotes = -1;

            Object.keys(opts).forEach((key, keyindex) => {
                if (opts[key] > maxVotes) {
                    if (!isNaN(key)) var type = "yn";
                    else var type = "mc";

                    choice = `**${polls.fetch(index).choices[keyindex]}** (${emotes.full[type][keyindex]})`;
                    maxVotes = opts[key];
                }
                else if (opts[key] == maxVotes) {
                    if (!isNaN(key)) var type = "yn";
                    else var type = "mc";

                    choice += `, **${polls.fetch(index).choices[keyindex]}** (${emotes.full[type][keyindex]})`;
                }
            });

            var embed = m.embeds[0];
            embed.description = `Poll has ended.\n\n${choice} received the majority of votes.`;

            m.edit(embed);
            m.reactions.removeAll();
            polls.remove(index);
        });

        message.channel.send("Removed the poll.").then(m => {
            m.delete({timeout: 5000});
            message.delete({timeout: 5000});
        });

    }
    else {
        //An index was not properly specified

        message.delete({timeout: 5000});
        message.channel.send("Invalid poll index. Please specify a poll using the number index listed to the left of each poll in `/polls list`.").then(m => m.delete({timeout: 10000}));
    }

}

module.exports = {
    commands: [
        new Command("poll", (message, args) => {

            //Use Interface.Interface() here to get the following details for each poll:
            // [poll-type, question, choices, max choices per user]

            // or

            //Use one-line syntax to get following details:
            // poll-type | question | choices | max choices per user
            
            //This poll system will require a ReactionCollector and reaction interpreter mechanism





            //First, set a var to args[0] to see what action to take (create poll | list polls | show results | end poll)
            var action = args[0];

            if (!args) return message.channel.send("Please specify one of the following actions as an argument: create, list, results, end.")

            //Then, create newArgs consisting of all args except the action arg above
            var newArgs = args.slice(1);

            //Finally, check the value of the var with args[0] and call the respective methods for the requested action
            switch (action.toLowerCase()) {
                case "create":
                    createPoll(message, newArgs);
                break;
                case "list":
                    listPolls(message);
                break;
                case "results":
                case "progress":
                    pollProgress(message, newArgs);
                break;
                case "stop":
                case "end":
                    endPoll(message, newArgs);
                break;
            }


        }, {
            //Donors, staff members, and partners can utilize polls
            roles: ["Iron VIP", "Gold VIP", "Blood VIP", "Staff", "Partner"]
        }, false, "A command to create yea/nay and/or multiple-choice polls (max 10 votable options).").attachArguments([
            {
                name: "create | list | results | end",
                optional: false
            },
            {
                name: "poll arguments | poll index",
                optional: true
            }
        ]),
        new Alias("polls", "poll")
    ],
    polls: {
        progress: pollProgress,
        list: listPolls,
        create: createPoll,
        end: endPoll
    },
    votes: {
        add: handleAddVote,
        retract: handleRetractVote
    }
};