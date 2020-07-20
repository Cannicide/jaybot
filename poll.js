//Command to create polls and votes.

var Command = require("./command");
var Interface = require("./interface");

module.exports = new Command("poll", (message, args) => {

    //Use Interface.Interface() here to get the following details for each poll:
    // [question, choices, max number of answer choices a user can select, channel to send poll in]
    //
    //This poll system will require a RoleCollector and role interpreter mechanism, which will be part of the upcoming
    //pagination update. Because of this requirement, I will hold off on the poll command until pagination is completed.

}, false, false, "A command to create polls and votes (max 10 choices).");