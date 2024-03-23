const { MongoClient } = require("mongodb");
const express = require('express');
const app = express();
const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

const uri = "mongodb+srv://new-user:1234@cluster0.q3hx2vh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

app.get('/', function(req, res) {
    if (req.cookies.authCookie) {
        res.send(`
            <p>You are authenticated!</p>
            
            <p><a href="/showcookie">Show Cookies</a></p>
            <p><a href="/clearcookies">Clear Cookies</a></p>
        `);
    } else {
        res.send(`
            <p>You are not authenticated. Please log in or register.</p>
            <p><a href="/login">Login</a></p>
            <p><a href="/register">Register</a></p>

            <p><a href="/showcookie">Show Cookies</a></p>
        <p><a href="/clearcookies">Clear Cookies</a></p>
        `);
    }
});

app.get('/register', function(req, res) {
    res.send(`
        <h1>Please create a Username and Password below.</h1>
        <form action="/newUserCreated" method="post">
            <div>
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Register</button>
        </form>

        <p><a href="/showcookie">Show Cookies</a></p>
        <p><a href="/clearcookies">Clear Cookies</a></p>
    `);
});

app.post('/newUserCreated', function(req, res) {
    const client = new MongoClient(uri);

    const userID = req.body.username;
    const pass = req.body.password;
    const doc2insert = { 
        userID: userID, 
        pass: pass,
    };

    async function run() {
        try {
            const database = client.db('Database1');
            const where2put = database.collection('LoginCreds');

            const doit = await where2put.insertOne(doc2insert);
            console.log(doit);
            res.send(`
                <p>New user created with Username: ${userID}</p>
                <p><a href="/login">Continue to Log In</a></p>

                <p><a href="/showcookie">Show Cookies</a></p>
        <p><a href="/clearcookies">Clear Cookies</a></p>
            `);
        } finally {
            await client.close();
        }
    }

    run().catch(console.dir);
});

app.get('/login', function(req, res) {
    res.send(`
        <h1>Login</h1>
        <form action="/showcookie" method="post">
            <div>
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
        </form>

        <p><a href="/showcookie">Show Cookies</a></p>
        <p><a href="/clearcookies">Clear Cookies</a></p>
    `);
});

app.post('/showcookie', function(req, res) {
    const client = new MongoClient(uri);

    async function run() {
        try {
            const database = client.db('Database1');
            const where2look = database.collection('LoginCreds');
            const userID = req.body.username;
            const pass = req.body.password;
            const query = {
                userID: userID,
                pass: pass,
            };

            console.log("Looking for: " + JSON.stringify(query));

            const user = await where2look.findOne(query);

            if (user) {
                console.log('User found:', user);
                res.cookie('authCookie', userID, { maxAge : 40000 }); 
                res.send(`
                    <p>User found: ${JSON.stringify(user)}</p>
                    <p><a href="/">Continue</a></p>


                    <p><a href="/showcookie">Show Cookies</a></p>
        <p><a href="/clearcookies">Clear Cookies</a></p>
                `);
            } else {
                console.log('User not found');
                res.send(`
                <p>'User not found'</p>
                <p><a href="/">Return to Home</a></p>

                <p><a href="/showcookie">Show Cookies</a></p>
        <p><a href="/clearcookies">Clear Cookies</a></p>
                `);
            }

        } finally {
            await client.close();
        }
    }

    run().catch(console.dir);
});

app.get('/clearcookies', function(req, res) {
    res.clearCookie('authCookie');
    res.send(`
        <p>Cookie cleared successfully.</p>
        <p><a href="/">Return to Home</a></p>
    `);
});

app.get('/showcookie', function(req, res) {
    const activeCookies = Object.entries(req.cookies).map(([key, value]) => {
        return `<p>${key}: ${value}</p>`;
    }).join('');

    res.send(`
        <h2>Active Cookies:</h2>
        ${activeCookies}
        <p><a href="/">Return to Home</a></p>
    `);
});
