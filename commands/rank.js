//A ranking system based on users' discord activity with in-discord rewards

// var Command = require("../command");
// var evg = new (require("../evg"))("ranks");

// //Ranking System:

// function RankingSystem() {
//     let ranks = evg.get()["ranks"];

//     function updateUsers(obj) {
//         var sysadm = evg.get();
//         sysadm["users"] = obj;
//         evg.set(sysadm);
//     }

//     function getTotalPrestigeXP() {
//         var total = 0;
//         ranks.forEach((item) => {
//             total += Number(item["ending-xp"]);
//         })

//         return total;
//     }

//     this.getTotalXP = getTotalPrestigeXP;

//     function romanNumeral(num) {
//         var numeralCodes = [["","I","II","III","IV","V","VI","VII","VIII","IX"],         // Ones
//                             ["","X","XX","XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"],   // Tens
//                             ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM"]];        // Hundreds

//         var numeral = "";
//         var digits = num.toString().split('').reverse();
//         for (var i=0; i < digits.length; i++){
//         numeral = numeralCodes[i][parseInt(digits[i])] + numeral;
//         }
//         return numeral;  
//     }

//     this.getRomanNum = romanNumeral;

//     /**
//      * Checks whether or not a user exists given the message object that they sent.
//      */
//     this.userExists = (message) => {
//         let users = evg.get()["users"];
//         if (message.author.id in users) return true;
//         else return false;
//     }

//     /**
//      * Adds or resets the stats of a user, given a message object that they sent.
//      */
//     this.addUser = (message) => {
//         let users = evg.get()["users"];
//         users[message.author.id] = {
//             "rank": "Newbie",
//             "xp": 0,
//             "prestige": 0
//         };

//         updateUsers(users);
//     }

//     /**
//      * Gets a user object (with rank, xp, and prestige properties) given a message object that they sent.
//      */
//     this.getUser = (message) => {
//         let users = evg.get()["users"];
//         return users[message.author.id];
//     }

//     /**
//      * Returns the URL to a ranking card image given a user object and a message object that they sent.
//      */
//     this.getCard = (user, message) => {
//         var rank = user.prestige != 0 ? `[${romanNumeral(user.prestige)}] ${user.rank}` : user.rank;
//         var xp = user.prestige * getTotalPrestigeXP() + user.xp;
//         var total_xp, level, user_name, user_id, user_img;

//         ranks.forEach((item, index) => {
//             if (item.name == user.rank) {
//                 total_xp = user.prestige * getTotalPrestigeXP() + item["ending-xp"];
//                 level = index + 1 + (user.prestige * ranks.length);
//             }
//         });

//         let user_tag = message.author.tag.split("#");
//         user_name = user_tag[0];
//         user_id = user_tag[1];
//         user_img = message.author.displayAvatarURL();

//         return `https://cannicideapi.glitch.me/p/card/?user_name=${user_name}&user_id=${user_id}&level=${level}&rank=${rank}&xp=${xp}&max_xp=${total_xp}&img=${user_img}`;

//     }

//     /**
//      * Adds a specified amount of XP to a user given a message object that they sent. Users prestige when they surpass max rank.
//      */
//     this.addXP = (xp, message) => {
//         let users = evg.get()["users"];
//         let user = users[message.author.id];
//         let rank, rank_index;

//         user.xp = user.xp + xp;

//         ranks.forEach((item, index) => {
//             if (item.name == user.rank) {
//                 rank = item;
//                 rank_index = index;
//             }
//         });

//         if (user.xp >= rank["ending-xp"]) {
//             if (user.rank == ranks[ranks.length - 1].name) {
//                 //Is last rank, prestige
//                 user.prestige = user.prestige + 1;
//                 user.xp = 0;
//                 user.rank = ranks[0].name;
//             }
//             else {
//                 //Isn't last rank
//                 user.rank = ranks[rank_index + 1].name;
//                 user.xp = 0;
//             }
//         }

//         updateUsers(users);
//     }
// }

// var system = new RankingSystem();

// //Ranking Command:

// const {Attachment} = require("discord.js")

// var rank_command = new Command("rank", (message, args) => {

//     if (args.length > 0 && args[0]) {
//         let user = args[0];

//         if (!user.match("\#")) {
//             message.reply("in order to view another user's rank you must use their user tag.\nFor example: `Cannicide#2753`");
//         }
//         else {
//             var mem = message.guild.members.cache.find(m => m.user.tag == user);
//             if (mem) {
//                 let mem_id = mem.user.id;

//                 if (system.userExists({author: {id: mem_id}})) {
//                     let stored_user = system.getUser({author: {id: mem_id}});
//                     let card = system.getCard(stored_user, mem.lastMessage);
//                     message.channel.send({files:[{attachment: card, name: "rank-card.png"}]});
//                 }
//                 else {
//                     message.reply("the specified user `" + user + "` has not sent any messages in the server and does not have a rank yet.");
//                 }
//             }
//             else {
//                 //User does not exist
//                 message.reply("the specified user `" + user + "` does not exist in this server.");
//             }
//         }
//     }
//     else {
//         //Return the command user's own rank card (after sending the command, user MUST have a rank)
//         let stored_user = system.getUser(message);
//         let card = system.getCard(stored_user, message);
//         message.channel.send({files:[{attachment: card, name: "rank-card.png"}]});
//     }

// }, false, false, "View your rank or another user's rank.").attachArguments([
//     {
//         name: "user-tag",
//         optional: true
//     }
// ]);

// var toplist = new Command("toplist", (message, args) => {

//     var users = evg.get()["users"];
//     var ranks = evg.get()["ranks"];
//     var top5 = ["-", "-", "-", "-", "-"];

//     var userSet = [];

//     Object.keys(users).forEach((item) => {
//         var level = 1;

//         ranks.forEach((rank, index) => {
//             if (rank.name == users[item].rank) {
//                 level = index + 1 + (users[item].prestige * ranks.length);
//             }
//         });

//         var username = "";

//         if (message.guild.members.cache.get(item)) {
//             username = message.guild.members.cache.get(item).user.tag;
//             userSet.push({
//                 id: item,
//                 xp: users[item].xp + users[item].prestige * system.getTotalXP(),
//                 prestige: users[item].prestige,
//                 level: level,
//                 name: username
//             });
//         }
//         else {
//             //User appears to not exist in the current guild, so do not push them to the userset.
//         }

//     });

//     userSet.sort((a, b) => (a.level > b.level) ? -1 : (a.level < b.level) ? 1 : ((a.xp > b.xp ? -1 : 1)));

//     var indexSubtractor = 0;

//     userSet.forEach((item, index) => {
//         if (index < 6) {
//             if (item.id != "668488976625303595") top5[index - indexSubtractor] = item;
//             else {
//                 indexSubtractor += 1;
//             }
//         }
//     });

//     var msg = "```md\n# Rank Leaderboards #\n\n";

//     top5.forEach((item, index) => {
//         if (item != "-") {
//             msg += `${index + 1}. <${item.name}>\n\n-   XP: ${item.xp}\n-   Level: ${item.prestige != 0 ? `[${system.getRomanNum(item.prestige)}] ` : ``}${item.level}\n\n`;
//         }
//         else {
//             msg += `${index + 1}. <->\n\n`;
//         }
//     })

//     msg += "\n```";

//     message.channel.send(msg);

// }, false, false, "View the rank leaderboards for the server (top 5).");



// module.exports = {
//     commands: [rank_command, toplist],
//     system: system
// }

//Ranking system has been removed. Might be rewritten and added back in later.