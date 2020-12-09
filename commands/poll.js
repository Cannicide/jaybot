//Command to create polls and votes.

var Command = require("../command");
var Interface = require("../interface");
var Reactions = new (require("../evg"))("reactions");

var emotes = {
    mc: ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯"],
    yn: ["713053971757006950", "713053971211878452"]
}

//Helper methods for polls
var polls = {
    add: (message, question, choices, maxChoices, type) => {
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
            channelID: message.channel.id
        };

        if (type == "mc") {
            item.name = emotes.mc;

            if (choices.length > 10) return message.channel.send("Multiple-choice polls can only have a maximum of ten choices.");
        }
        else if (type == "yn") {
            item.id = emotes.yn;

            if (choices.length > 2) return message.channel.send("Yea/nay polls can only have a maximum of two choices.");
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
    votes: {
        add: (sorted_index, choice, user) => {
            //Adds a vote to the specified poll
            var cache = Reactions.get();
            var index = polls.findIndex(sorted_index);

            cache[index].votes[choice] += 1;

            //Add user to voters list with one vote if not present, or increment user's votes if present
            if (user.id in cache[index].voters) cache[index].voters[user.id] += 1;
            else cache[index].voters[user.id] = 1;

            //If user's votes is higher than vote limit, remove excess votes
            if (cache[index].voters[user.id] > cache[index].voteLimit) {
                cache[index].voters[user.id] -= 1;
                cache[index].votes[choice] -= 1;
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

            Reactions.set(cache);
        }
    }
}

function createPoll(message) {
    //Create a poll message and saves data to reactions.json
}

function handleAddVote(reaction, user) {
    //Handle votes by saving vote data to reactions.json and ensuring that max choices per user is not exceeded
}

function handleRetractVote(reaction, user) {
    //Handle votes by saving vote data to reactions.json and ensuring that max choices per user is not exceeded
}

function pollProgress(message, poll_index) {
    //Show the current and/or final results of a poll
}

function listPolls(message) {
    //List all of the current polls - no need for guild checks since only one guild is being used
}

function endPoll(message) {
    //Ends a specified poll
}

module.exports = new Command("poll", (message, args) => {

    //Use Interface.Interface() here to get the following details for each poll:
    // [poll-type, question, choices, max choices per user]

    // or

    //Use one-line syntax to get following details:
    // poll-type | question | choices | max choices per user
    
    //This poll system will require a ReactionCollector and reaction interpreter mechanism



}, false, false, "A command to create polls and votes (max 6 choices).");