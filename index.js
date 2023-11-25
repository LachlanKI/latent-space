// TODO: dotenv is only required for serving locally, AWS loads the credentials from a '.env' file located in the root of the project. Don't push this file as it contains AWS secrets; the '.gitignore' is ignoring it
require('dotenv').config();

// vars
const express = require("express");
const app = express();
const basicAuth = require('basic-auth');
const bodyParser = require("body-parser");
const server = require("http").Server(app);
const path = require("path");
const { v4 } = require('uuid');

// functions
const { handleMessage, getQuestionStats, fetchGlobalValues, getAllQuestionStatistics, getAllConversations, rando } = require("./utils");

const auth = function(req, res, next) {
    const creds = basicAuth(req);
    if (!creds || creds.name != 'k3s' || creds.pass != 'h4ckth3pl4n3t') {
        res.setHeader('WWW-Authenticate', 'Basic realm=www');
        res.sendStatus(401);
    } else {
        next();
    };
};

// middleware
app.use(express.static("public"));
app.use(bodyParser.json());

// (╯°益°)╯彡┻━┻ -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

// ROUTES TO REPLACE SOCKET

app.get('/lex-id', (req, res) => {
    res.status(200).send((Date.now() + v4()).replace(/-|_/g, ''))
});

app.post('/send-message', (req, res) => {
    handleMessage(req.body.lexId, req.body.message).then(result => {
        const { success, sentiment } = result;
        if (!success) {
            console.error('lex is returning error');
        };
        setTimeout(() => {
            res.json({success: success, sentiment: sentiment});
        }, rando(500, 2000));
    });
});

app.get('/fetch-question-stats', (req, res) => {
    getQuestionStats(req.query).then(result => {
        res.json(result);
    });
});

app.get('/fetch-global-values', (req, res) => {
    fetchGlobalValues().then(result => {
        res.json(result);
    });
});

// (╯°益°)╯彡┻━┻ -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

app.get('/data-global-stats', [auth], (req, res) => {
    fetchGlobalValues().then(result => {
        if (result.success) {
            res.json({success: true, result});
        } else { 
            res.json({success: false});
        };
    });
});

app.get('/data-questions', [auth], (req, res) => {
    getAllQuestionStatistics().then(result => {
        if (result.success) {
            res.json({success: true, result});
        } else {
            res.json({success: false});
        };
    });
});

app.get('/data-conversations', [auth], (req, res) => {
    getAllConversations().then(result => {
        if (result.success) {
            res.json({success: true, result});
        } else {
            res.json({success: false});
        };
    });
});

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});

app.get('/data', (req, res) => {
    res.sendFile('data.html', { root: path.join(__dirname, 'public') });
});

app.all("*", (req, res) => res.redirect("/"));

server.listen(process.env.PORT || 8080, () => console.log("(っ˘з(˘⌣˘ ) ♡"));
