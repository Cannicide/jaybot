const { Sifbase } = require("sifbase");
const sql = require("sequelize");
require("dotenv").config({ path: Sifbase.dirname + "/../.env" });

const miniget = require("miniget");
// @ts-ignore
const Trello = require("trello-node-api")(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN);
const Discord = require("discord.js");

module.exports.client = new Discord.Client({
    // @ts-ignore
    intents: require("djs-vidar").allIntents()
});
module.exports.Discord = Discord;

module.exports.express = require("express");
module.exports.app = require("express")();
module.exports.path = require("path");

module.exports.sequelize = sql;
const sqlite = new (sql.Sequelize)({
    dialect: 'sqlite',
    storage: 'storage/db.sqlite'
});
(async () => {
    try {
        await sqlite.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        throw new Error('Unable to connect to the database: ' + error.message);
    }
})();

const db = (name) => `${Sifbase.dirname}/../storage/${name}.json`;
module.exports.db = {
    get rrReactions() { return new Sifbase(db("reactions")) },
    get rrRoles() { return new Sifbase(db("roles")) },
    sqlite,
    general: false,
    stats: false,
    ServerStat: sqlite.define('ServerStat', {
        timestamp: {
          type: sql.DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        online: {
          type: sql.DataTypes.BOOLEAN,
          allowNull: false
        },
        players: {
            type: sql.DataTypes.INTEGER,
            allowNull: false
        },
        maxPlayers: {
            type: sql.DataTypes.INTEGER,
            allowNull: false
        }
    }),
    StatCategory: sqlite.define('StatCategory', {
        categoryId: {
          type: sql.DataTypes.STRING,
          allowNull: false,
          primaryKey: true
        },
        isDestroyable: {
            type: sql.DataTypes.BOOLEAN,
            defaultValue: true
        }
    }),
    PlayerRank: sqlite.define('PlayerRank', {
        playerId: {
            type: sql.DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        playerAvatar: {
            type: sql.DataTypes.STRING,
            allowNull: false
        },
        playerUsername: {
            type: sql.DataTypes.STRING,
            allowNull: false
        },
        xp: {
            type: sql.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        level: {
            type: sql.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        xpMonthly: {
            type: sql.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        levelMonthly: {
            type: sql.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        monthTimestamp: {
            type: sql.DataTypes.INTEGER,
            allowNull: false
        },
        cooldown: {
            type: sql.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        messages: {
            type: sql.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        customColor: {
            type: sql.DataTypes.STRING,
            allowNull: true
        }
    })
};
sqlite.sync();

module.exports.mcstats = async () => {
    const stats = JSON.parse(await miniget("https://api.mcstatus.io/v2/status/java/zombiehorde.net?query=false").text());
    return stats;
};

module.exports.postTrello = async ({ title, desc, label, image }) => {
    const data = {
        name: title,
        desc,
        pos: 'bottom',
        idList: process.env.BUGS_LIST, //REQUIRED
        due: null,
        dueComplete: false,
        idMembers: [],
        idLabels: [label],
        urlSource: image
    };

    try {
        await Trello.card.create(data);
    }
    catch (error) {
        console.log('Trello card creation error:', error);
    };
};

module.exports.discordCard = require("discord-arts-zhorde").profileImage;

module.exports.events = [];
module.exports.createEvent = ({ name, handler }) => {
    module.exports.events.push({ name, handler });
};

module.exports.wait = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

module.exports.constants = {
    guilds: process.env.ENVIRONMENT == "TESTING" ? ["668485643487412234"] : ["668485643487412234", "351824506773569541"],
    mainGuild: process.env.ENVIRONMENT == "TESTING" ? "668485643487412234" : "351824506773569541",
    token: process.env.ENVIRONMENT == "TESTING" ? process.env.TOKEN_TEST : process.env.TOKEN
};