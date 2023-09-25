const { app, path, express } = require("../panacea");
const { getTop100, getUser } = require("./ranks");

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '/../../web/build')));

// Util function to enable restrictive CORS headers on a route
function cors(res) {
    res.set('Access-Control-Allow-Origin', 'http://localhost:8501');
}

// API get top 100 ranks
app.get("/api/ranks/top", async (req, res) => {
    cors(res);
    res.type("json");

    const top = await getTop100();
    if (!top?.length) return res.send({ error: "ErrorNoExist: Failed to find all-time rank data." });

    res.send(JSON.stringify(top));
});

// API get top 100 monthly ranks
app.get("/api/ranks/top/monthly", async (req, res) => {
    cors(res);
    res.type("json");

    const top = await getTop100(true);
    if (!top?.length) return res.send({ error: "ErrorNoExist: Failed to find monthly rank data." });

    res.send(JSON.stringify(top));
});

// API get rank data of single user
app.get("/api/ranks/user/:id", async (req, res) => {
    cors(res);
    res.type("json");

    if (!req.params.id) return res.send({ error: "ErrorBadInput: Invalid user ID provided." });

    const user = await getUser(req.params.id);
    // @ts-ignore
    if (!user?.playerId) return res.send({ error: "ErrorNoExist: Failed to find user rank data." });
    res.send(JSON.stringify(user));
});

// React route handling
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../../web/build/index.html'));
});

// Setup express
app.listen(8500);