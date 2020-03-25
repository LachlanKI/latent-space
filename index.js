// TODO: dotenv is only required for serving locally, AWS loads the credentials from a '.env' file located in the root of the project. Don't push this file as it contains AWS secrets; the '.gitignore' is ignoring it
require('dotenv').config();

// vars
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4 } = require('uuid');

// functions
const { handleMessage, rando } = require("./utils");

// middleware
app.use(express.static("./public"));
app.use(bodyParser.json());

io.on("connection", function(socket) {
    // NOTE: created a uuid to append to the socket id, ensures that when we upload results to dynamodb there will be a unique primary partition key
    socket.lexId = (socket.id + v4()).replace(/-|_/g, '');
    // TODO: have this event go to lex and get an actual response
    socket.on('hello', () => {
        socket.emit('hi_there', {success: true, message: 'hello....... uWu :3'});
    });

    socket.on('send_message', responseAndAnswer => {
        handleMessage(socket.lexId, responseAndAnswer).then(result => {
            const { success, sentiment } = result;
            if (!success) {
                console.error('lex is returning error');
            };
            setTimeout(() => {
                socket.emit('response', {success: success, sentiment: sentiment});
            }, rando(500, 2000));
        });
    });

});

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.all("*", (req, res) => res.redirect("/"));

server.listen(process.env.PORT || 8080, () => console.log("(っ˘з(˘⌣˘ ) ♡"));
