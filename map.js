//Command to randomly choose a map in a more advanced way than the in-game map chooser

var Command = require("./command");
var Interface = require("./interface");

//Selections:
const maps = ["Area 935", "Cold Dead", "Stygia", "Dawn of the Horde", "Dread Space", "Curse of the Horde", "Fallen", "Left to Rot", "Grains", "Hordelands", "Nowhere Fast", "Undead High", "6 Blocks Under", "Boziem Desert", "Anguith City", "Nuketown 2025", "Mansion of Massacre", "Cruise of Chaos", "Trench of Terror", "Haunted Halls", "Mathus Station", "Knight of the Dead", "Sanctuary", "Shipwrecked", "Incarceration", "Cobas Calamity", "Sewers of Surprise", "Submerged"];
const sagas = [
    {
        name: "Rise of the Horde",
        maps: ["Anguith City", "Dawn of the Horde", "Nowhere Fast"]
    },
    {
        name: "The Boziem Curse",
        maps: ["Curse of the Horde", "Boziem Desert"]
    },
    {
        name: "The Final Vacation",
        maps: ["Cruise of Chaos", "Shipwrecked"]
    },
    {
        name: "Jungle Calamity",
        maps: ["Trench of Terror", "Left to Rot", "Cobas Curse"]
    },
    {
        name: "Kingdom of the Horde",
        maps: ["Hordelands", "Knight of the Dead"]
    },
    {
        name: "The Final Frontier",
        maps: ["Dread Space", "Mathus Station", "Submerged"]
    },
    {
        name: "Dusk of the Horde",
        maps: ["Area 935", "Nuketown 2025", "Fallen"]
    }
];

//Random chooser:
function randomNumber(length) {
    return Math.floor(Math.random() * length);
}

function randomMap() {
    var rand = randomNumber(maps.length);
    return maps[rand];
}

function randomSaga() {
    var rand = randomNumber(sagas.length);
    return sagas[rand];
}

module.exports = new Command("map", (message, args) => {

    var types = ["Normal Map", "Insane Map", "Map Saga"];

    var response = new Interface.FancyMessage("Random Map Selector", "Which of the following would you like to play?", types, {
        title: "#",
        bullet: "*"
    }).get();

    var chooser = new Interface.Interface(message, response, (choice, menu) => {

        if (!choice){}
        else {
            var answer = choice.content;
            var matchesType = false;
    
            types.forEach((item) => {
                if (item.toLowerCase() == answer.toLowerCase() || item.substring(0, item.length - 1).toLowerCase() == answer.toLowerCase()) {
                    matchesType = item;
                }
                else if (item.toLowerCase().match(answer.toLowerCase())) {
                    matchesType = item;
                }
            });

            if (matchesType) {
                //Chose a valid topic
                var wheel = "https://media.discordapp.net/attachments/668519540384333864/712341221309415464/Mx9Z4G4m8l.gif";
                var insaneEmote = "<a:flame:712338342364315739>";
                var spinnerEmote = "<a:spinner:712338342196281345>";
                message.channel.send(wheel).then(spinner => {
                    setTimeout(() => {
                        if (matchesType == "Normal Map") {
                            var map = randomMap();
                            spinner.edit(`${spinnerEmote} **Selected Map:** ${map}`);
                        }
                        else if (matchesType == "Insane Map") {
                            var map = randomMap();
                            spinner.edit(`${spinnerEmote} **Selected Map:** ${insaneEmote} ${map} (Insane)`);
                        }
                        else if (matchesType == "Map Saga") {
                            var saga = randomSaga();
                            var sagaName = saga.name;
                            var sagaMaps = saga.maps.join(" -> ");
                            spinner.edit(`${spinnerEmote} **Selected Map Saga:** ${sagaName}\n**Maps:** ${sagaMaps}`);
                        }
                    }, 4000);
                });
            }
            else {
                //Did not choose a valid topic
                message.channel.send("You did not select a valid map-type. Please try again.");
            }

            menu.edit(`✅ Map-type selection successfully completed.`);

        }

    });

}, false, false, "An advanced random map selector for indecisive players.");