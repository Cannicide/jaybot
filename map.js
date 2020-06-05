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

//Map wheel images:
const wheels = [
    {name: "Area 935", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FArea%20935.png?v=1591119546318"},
    {name: "Cold Dead", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FCold%20Dead.png?v=1591119559264"}, 
    {name: "Stygia", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FStygia.png?v=1591119673583"}, 
    {name: "Dawn of the Horde", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FDawn.png?v=1591119571029"}, 
    {name: "Dread Space", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FDread%20Space.png?v=1591119576616"}, 
    {name: "Curse of the Horde", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FCurse.png?v=1591119566983"}, 
    {name: "Fallen", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FFallen.png?v=1591119581107"}, 
    {name: "Left to Rot", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FLeft%20to%20Rot.png?v=1591119623461"}, 
    {name: "Grains", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FGrains.png?v=1591119585719"}, 
    {name: "Hordelands", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FHordelands.jpg?v=1591119594684"}, 
    {name: "Nowhere Fast", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FNowhere%20Fast.png?v=1591119639967"}, 
    {name: "Undead High", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FUndead%20High.png?v=1591119685298"}, 
    {name: "6 Blocks Under", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2F6blocks.png?v=1591119537691"}, 
    {name: "Boziem Desert", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FBoziem.png?v=1591119549899"}, 
    {name: "Anguith City", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FAnguith.png?v=1591119540908"}, 
    {name: "Nuketown 2025", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FNuketown.png?v=1591119644777"}, 
    {name: "Mansion of Massacre", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FMansion.png?v=1591119628965"}, 
    {name: "Cruise of Chaos", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FCruise.png?v=1591119563184"}, 
    {name: "Trench of Terror", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FTrench.png?v=1591119680286"}, 
    {name: "Haunted Halls", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FHauntedHalls.png?v=1591119590206"}, 
    {name: "Mathus Station", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FMathus.png?v=1591119634238"}, 
    {name: "Knight of the Dead", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FKnight.png?v=1591119618900"}, 
    {name: "Sanctuary", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FSanctuary.png?v=1591119649864"}, 
    {name: "Shipwrecked", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FShipwrecked.png?v=1591119665827"}, 
    {name: "Incarceration", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FIncarceration.png?v=1591119605183"}, 
    {name: "Cobas Calamity", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FCobas.png?v=1591119554206"}, 
    {name: "Sewers of Surprise", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FSewers.png?v=1591119656408"}, 
    {name: "Submerged", image: "https://cdn.glitch.com/815b6ec0-cdbf-4b44-afd2-60f27a075bc8%2FSubmerged.png?v=1591119677992"}
]

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

    if (args[0]) {
        var answer = args[0];
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
                //var wheel = "https://media.discordapp.net/attachments/668519540384333864/712341221309415464/Mx9Z4G4m8l.gif";
                var wheel = "https://cdn.discordapp.com/attachments/668519540384333864/717419461770215485/colorwheel.gif";
                var insaneEmote = "<a:flame:712338342364315739>";
                var spinnerEmote = "<a:spinner:712338342196281345>";
                var spinnerResp;
                var chosen;
                var img;

                if (matchesType == "Normal Map") {
                    chosen = randomMap();
                    spinnerResp = `${chosen}`;
                    img = wheels.find(m => m.name == chosen).image;
                }
                else if (matchesType == "Insane Map") {
                    chosen = randomMap();
                    spinnerResp = `${insaneEmote} ${chosen} (Insane)`;
                    img = wheels.find(m => m.name == chosen).image;
                }
                else if (matchesType == "Map Saga") {
                    chosen = randomSaga();
                    var saga = chosen;
                    var sagaName = saga.name;
                    var sagaMaps = saga.maps.join(" -> ");
                    spinnerResp = `${sagaName}\n**Maps:** ${sagaMaps}`;
                    img = wheels.find(m => m.name == "Area 935").image;
                }

                if (args[1] && matchesType == "Map Saga") {
                    message.channel.send("Selecting from a preset list of maps is not supported for Map Sagas at this time.");
                    return;
                }
                else if (args[1]) {
                    var user_choices = args.join(" ").replace(" ", ";;split;;").split(";;split;;")[1].split(",");
                    chosen = user_choices[randomNumber(user_choices.length)];
                    spinnerResp = `${matchesType == "Insane Map" ? insaneEmote + " " + chosen + " (Insane)" : chosen}`;
                    img = wheels.find(m => m.name == "Area 935").image;
                }

                var embed = new Interface.Embed(message, "", [
                    {
                        name: `*The wheel shall decide your fate...*`,
                        value: `**Selected Map${matchesType == "Map Saga" ? " Saga" : ""}:** Selecting...`
                    }
                ]);

                embed.embed.title = spinnerEmote + " Random Map Selector";
                embed.embed.image.url = wheel;

                message.channel.send(embed).then(spinner => {
                    setTimeout(() => {
                        embed = new Interface.Embed(message, "", [
                            {
                                name: `*The wheel hath decided...*`,
                                value: `**Selected Map${matchesType == "Map Saga" ? " Saga" : ""}:** ${spinnerResp}`
                            }
                        ])

                        embed.embed.title = spinnerEmote + " Random Map Selector";
                        embed.embed.image.url = img;

                        spinner.edit(embed);
                    }, 4000);
                });
            }
            else {
                //Did not choose a valid topic
                message.channel.send("You did not select a valid map-type. Please try again.");
            }
    }
    else {
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
                    //var wheel = "https://media.discordapp.net/attachments/668519540384333864/712341221309415464/Mx9Z4G4m8l.gif";
                    var wheel = "https://cdn.discordapp.com/attachments/668519540384333864/717419461770215485/colorwheel.gif";
                    var insaneEmote = "<a:flame:712338342364315739>";
                    var spinnerEmote = "<a:spinner:712338342196281345>";
                    var spinnerResp;
                    var chosen;
                    var img;

                    if (matchesType == "Normal Map") {
                        chosen = randomMap();
                        spinnerResp = `${chosen}`;
                        img = wheels.find(m => m.name == chosen).image;
                    }
                    else if (matchesType == "Insane Map") {
                        chosen = randomMap();
                        spinnerResp = `${insaneEmote} ${chosen} (Insane)`;
                        img = wheels.find(m => m.name == chosen).image;
                    }
                    else if (matchesType == "Map Saga") {
                        chosen = randomSaga();
                        var saga = chosen;
                        var sagaName = saga.name;
                        var sagaMaps = saga.maps.join(" -> ");
                        spinnerResp = `${sagaName}\n**Maps:** ${sagaMaps}`;
                        img = wheels.find(m => m.name == "Area 935").image;
                    }

                    var embed = new Interface.Embed(message, "", [
                        {
                            name: `*The wheel shall decide your fate...*`,
                            value: `**Selected Map${matchesType == "Map Saga" ? " Saga" : ""}:** Selecting...`
                        }
                    ]);

                    embed.embed.title = spinnerEmote + " Random Map Selector";
                    embed.embed.image.url = wheel;

                    message.channel.send(embed).then(spinner => {
                        setTimeout(() => {
                            embed = new Interface.Embed(message, "", [
                                {
                                    name: `*The wheel hath decided...*`,
                                    value: `**Selected Map${matchesType == "Map Saga" ? " Saga" : ""}:** ${spinnerResp}`
                                }
                            ])

                            embed.embed.title = spinnerEmote + " Random Map Selector";
                            embed.embed.image.url = img;

                            spinner.edit(embed);
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
    }

}, false, false, "An advanced random map selector for indecisive players.").attachArguments([
    {
        name: "map type",
        optional: true
    },
    {
        name: "list of maps separated by commas",
        optional: true
    }
]);