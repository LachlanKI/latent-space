require('dotenv').config()

const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const server = require("http").Server(app);
const io = require("socket.io")(server);

const { v4 } = require('uuid');

const { handleMessage } = require("./utils");

app.use(express.static("./public"));
app.use(bodyParser.json());

function rando(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

io.on("connection", function(socket) {
    socket.lexId = socket.id + v4();

    socket.on('hello', () => {
        socket.emit('hi_there', {success: true, message: 'hello....... uWu :3'});
    });

    socket.on('send_message', message => {
        console.log('that socket sending a message', message);
        handleMessage(socket.lexId, message).then(result => {
            const { success, message } = result;
            if (!success) {
                console.log('lex is returning error');
            }
            setTimeout(() => {
                socket.emit('response', {success: success, message: message});
            }, rando(500, 2000));
        })
    });
});

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.all("*", (req, res) => res.redirect("/"));

server.listen(process.env.PORT || 8080, () => console.log("(っ˘з(˘⌣˘ ) ♡"));
