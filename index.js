// TODO: dotenv is only required for serving locally, AWS loads the credentials from a '.env' file located in the root of the project. Don't push this file as it contains AWS secrets; the '.gitignore' is ignoring it
require('dotenv').config();

// vars
const express = require("express");
const app = express();
const basicAuth = require('basic-auth');
const bodyParser = require("body-parser");
const server = require("http").Server(app);
const io = require("socket.io")(server);
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

io.on("connection", function(socket) {
    // NOTE: created a uuid to append to the socket id, ensures that when we upload results to dynamodb there will be a unique primary partition key
    socket.lexId = (socket.id + v4()).replace(/-|_/g, '');
    // TODO: have this event go to lex and get an actual response
    socket.on('hello', () => {
        socket.emit('hi_there', {success: true, message: 'hello....... uWu :3'});
    });

    socket.on('send_message', data => {
        handleMessage(socket.lexId, data).then(result => {
            const { success, sentiment } = result;
            if (!success) {
                console.error('lex is returning error');
            };
            setTimeout(() => {
                socket.emit('response', {success: success, sentiment: sentiment});
            }, rando(500, 2000));
        });
    });

    socket.on('fetch_question_stats', data => {
        console.log('in fetch_question_stats', data);
        (async () => {
            let result = await getQuestionStats(data.ids);
            socket.emit('q_response', result);
        })();
    });

    socket.on('fetch_global_values', () => {
        console.log('in fetchglobalvaluers');
        (async () => {
            let result = await fetchGlobalValues();
            socket.emit('global_response', result);
        })();
    });

});

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
