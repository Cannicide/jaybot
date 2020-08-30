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
    res.send(disc.users.find(m => m.tag == tag).displayAvatarURL);
  });
  
  app.get("/statistics/json", (req, res) => {
      res.sendFile(__dirname + "/storage/statistics.json");
  });

  app.get("/statistics/", (req, res) => {
      res.sendFile(__dirname + "/views/statistics.html");
  })
  
  app.use(bodyParser.json());
  
  app.post("/discordsrz", (req, res) => {
    console.log("DiscordSRZ:", req.body);
  });

}

module.exports = {
    setup: setup
}