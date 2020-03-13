const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
var lex = new AWS.LexRuntime();

// NOTE: this will not work without loading the AWS credentials via a '.env' file located in the root of the project

var params = {
    botAlias: "latent_space",
    botName: "drebin",
    inputText: null,
    userId: null,
    requestAttributes: {},
    sessionAttributes: {}
};

function handleMessage(id, message) {
    return new Promise((resolve, reject) => {

        var params = {
            botName: "drebin",
            botAlias: "latent_space",
            inputText: message,
            userId: id,
            requestAttributes: {},
            sessionAttributes: {}
        };

        lex.postText(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                resolve({success: false, message: 'something went wrong.... teeehee :3'})
            } else {
                // TODO: insert into dynamodb (use socket.lexId as the primary partition key)
                // TODO: the result also returns the slot values (eg, name, interest, etc...) > when uploading to database create a property for these slots
                resolve({success: true, message: data.message});
            }
        });

    });
}

function rando(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = {
    handleMessage,
    rando
};
