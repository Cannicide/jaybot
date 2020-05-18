//A Mod+ command to change the nicknames of other players.

var Command = require("./command");

module.exports = new Command("nickname", (message, args) => {

    var nick = "";

    if (args[0] && args[1]) {
        //Both a username and a nickname have been specified

        var user;
        
        args.forEach((item, index) => {
            if (index != 0) {
                nick += item + " ";
            }
        });

        if (message.mentions.members.first()) {
            //Use mention as username

            user = message.mentions.members.first();

            if (user.roles.find(r => r.name == "Staff")) {
                //Target user is a staff member, prevent nickname change

                message.channel.send("You do not have permission to change staff members' names, " + message.author.tag + ".");
            }
            else {
                user.setNickname(nick);
                message.channel.send(user.user.tag + "'s nickname has been set to " + nick);
            }

        }
        else if (args[0].match(/\#[0-9]{4}/)) {
            //Use args[0] as user tag

            user = message.guild.members.find(m => m.user.tag == args[0]);

            if (!user) {
                message.reply("that user does not exist in this guild.");
            }
            else if (user.roles.find(r => r.name == "Staff")) {
                //Target user is a staff member, prevent nickname change

                message.channel.send("You do not have permission to change staff members' names, " + message.author.tag + ".");
            }
            else {
                //Target user is not a staff member

                user.setNickname(nick);
                message.channel.send(user.user.tag + "'s nickname has been set to " + nick);
            }

        }
        else {
            //Use args[0] as a plain username (Not recommended, so ask user to use a user tag instead)

            message.reply("please use a user tag (username and then # and then 4 numbers) instead of a username.\nEx: `Cannicide#2753`");
        }


    }
    else if (args[0]) {
        //Only a username has been specified, just return the user's nickname

        var user;

        if (message.mentions.members.first()) {
            //Specified username is a mention

            user = message.mentions.members.first();
            message.channel.send(user.user.tag + "'s current nickname is " + user.nickname);
        }
        else if (args[0].match(/\#[0-9]{4}/)) {
            //Specified username is a tag

            user = message.guild.members.find(m => m.user.tag == args[0]);

            if (user) {
                message.channel.send(user.user.tag + "'s current nickname is " + user.nickname);
            }
            else {
                message.reply("that user does not exist in this guild.");
            }

        }
        else {
            //Specified username is just a username

            user = message.guild.members.find(m => m.user.username == args[0]);

            if (user) {
                message.channel.send(user.user.tag + "'s current nickname is " + user.nickname);
            }
            else {
                message.reply("that user does not exist in this guild.");
            }
        }

    }
    else {
        //Nothing has been specified
        message.channel.send(`Invalid syntax: a username must be specified.\nEx: \`/nickname Cannicide#2753 TheBestAdmin\``);
    }

}, {roles: ["Moderator", "Admin", "Owner"]}, false, "A Mod+ command to change the nicknames of other players.").attachArguments(
        [
            {
                name: "username",
                optional: false
            },
            {
                name: "nickname",
                optional: true
            }
        ]
    );