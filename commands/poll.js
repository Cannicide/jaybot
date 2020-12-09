//Command to create polls and votes.

var Command = require("../command");
var Interface = require("../interface");
var Reactions = new (require("../evg"))("reactions");

var emotes = {
    mc: ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯"],
    yn: ["713053971757006950", "713053971211878452"]
}

function createPoll() {
    //Create a poll message and save data to reactions.json
}

function handleVote() {
    //Handle votes by saving vote data to reactions.json and ensuring that max choices per user is not exceeded
}

function pollProgress() {
    //Show the current and/or final results of a poll
}

module.exports = new Command("poll", (message, args) => {

    //Use Interface.Interface() here to get the following details for each poll:
    // [poll-type, question, choices, max choices per user]

    // or

    //Use one-line syntax to get following details:
    // poll-type | question | choices | max choices per user
    
    //This poll system will require a ReactionCollector and reaction interpreter mechanism



}, false, false, "A command to create polls and votes (max 6 choices).");