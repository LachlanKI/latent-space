const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
var lex = new AWS.LexRuntime();

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

module.exports = {
    handleMessage
};
