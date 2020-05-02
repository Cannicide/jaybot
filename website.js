function setup(app) {

    app.get("/", (req, res) => {
        res.sendFile(__dirname + "/views/login.html");
    });

}

module.exports = {
    setup: setup
}