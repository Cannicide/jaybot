

function setup(app, disc) {
    const bodyParser = require("body-parser");
    app.use(bodyParser.urlencoded({ extended: true }));
    
    app.get("/", (req, res) => {
        res.sendFile(__dirname + "/views/login.html");
    });

    app.post("/dashboard", (req, res) => {
        if (req.body.password == process.env.DASHBOARD_PASSWORD) {
            res.sendFile(__dirname + "/views/index.html");
        }
        else {
            res.send("Wrong password. Try again <a href='/'>here</a>.");
        }
    });
  
  app.get("/profile/:user/:discrim", (req, res) => {
    res.header("Access-Control-Allow-Origin", "https://cannicideapi.glitch.me");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var tag = req.params.user + "#" + req.params.discrim;
    res.send(disc.users.cache.find(m => m.tag == tag).displayAvatarURL());
  });
  
  app.get("/statistics/json", (req, res) => {
      res.sendFile(__dirname + "/storage/statistics.json");
  });

  app.get("/statistics/", (req, res) => {
      res.sendFile(__dirname + "/views/statistics.html");
  })

  var auditActions = {
    ALL: null,
    GUILD_UPDATE: 1,
    CHANNEL_CREATE: 10,
    CHANNEL_UPDATE: 11,
    CHANNEL_DELETE: 12,
    CHANNEL_OVERWRITE_CREATE: 13,
    CHANNEL_OVERWRITE_UPDATE: 14,
    CHANNEL_OVERWRITE_DELETE: 15,
    MEMBER_KICK: 20,
    MEMBER_PRUNE: 21,
    MEMBER_BAN_ADD: 22,
    MEMBER_BAN_REMOVE: 23,
    MEMBER_UPDATE: 24,
    MEMBER_ROLE_UPDATE: 25,
    MEMBER_MOVE: 26,
    MEMBER_DISCONNECT: 27,
    BOT_ADD: 28,
    ROLE_CREATE: 30,
    ROLE_UPDATE: 31,
    ROLE_DELETE: 32,
    INVITE_CREATE: 40,
    INVITE_UPDATE: 41,
    INVITE_DELETE: 42,
    WEBHOOK_CREATE: 50,
    WEBHOOK_UPDATE: 51,
    WEBHOOK_DELETE: 52,
    EMOJI_CREATE: 60,
    EMOJI_UPDATE: 61,
    EMOJI_DELETE: 62,
    MESSAGE_DELETE: 72,
    MESSAGE_BULK_DELETE: 73,
    MESSAGE_PIN: 74,
    MESSAGE_UNPIN: 75,
    INTEGRATION_CREATE: 80,
    INTEGRATION_UPDATE: 81,
    INTEGRATION_DELETE: 82
  }

  app.get("/audit/raw", (req, res) => {
      var key = req.query.key || false;
      if (!key || key != process.env.ACCESS_KEY) return res.status(403).send("Access denied.");

      var guildID = req.query.guild || false;
      var userID = req.query.user || false;
      var limit = req.query.limit || false;
      var limitOverflow = limit && limit > 100 ? limit - 100 : false;
      var type;
      
      //Numeric type specified
      if (req.query.type && !isNaN(req.query.type)) type = req.query.type;
      //String type specified
      else if (req.query.type) type = auditActions[req.query.type];
      //No type specified
      else type = false;

      if (!guildID) return res.status(500).send("You must specify a guild ID in order to do that.");
      var guild = disc.guilds.cache.get(guildID);

      if (!guild) return res.status(404).send("Error: guild not found.");
      var auditOptions = {};

      if (userID) auditOptions.user = userID;
      if (limit) auditOptions.limit = limitOverflow ? 100 : limit;
      if (type || type == null) auditOptions.type = type;

      var entries;
      var last;
      var audit;

      async function repeatFetchAuditLog() {
        for (limitOverflow; limitOverflow > 0; limitOverflow -= 100) {
            auditOptions.before = last;
            auditOptions.limit = limitOverflow > 100 ? 100 : limitOverflow;
            audit = await guild.fetchAuditLogs(auditOptions);

            for (var entry of audit.entries.array()) {
                entries.push(entry);
            }

            last = audit.entries.last();
        }

        //Filter out statistics channel modification
        entries = entries.filter(entry => !(["CHANNEL_CREATE", "CHANNEL_DELETE"].includes(entry.action) && entry.executor == "668488976625303595"));
        // entries = entries.filter(entry => !(entry.reason == "[Statistics]" && entry.executor == "668488976625303595"));

        if (entries.length < limit) {
            limitOverflow = limit - entries.length;
            return repeatFetchAuditLog();
        }

        return true;
      }

      guild.fetchAuditLogs(auditOptions)
      .then(async auditLogs => {

        audit = auditLogs;
        entries = audit.entries.array();
        last = audit.entries.last();

        await repeatFetchAuditLog();

        res.send(JSON.stringify(entries));

      })
      .catch(err => res.status(500).send("Error: " + err));

  })
  
  app.use(bodyParser.json());

}

module.exports = {
    setup: setup
}