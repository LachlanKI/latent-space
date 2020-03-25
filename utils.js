const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const lex = new AWS.LexRuntime();
const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

// NOTE: this will not work without loading the AWS credentials via a '.env' file located in the root of the project

var params = {
    botAlias: "latent_space",
    botName: "drebin",
    inputText: null,
    userId: null,
    requestAttributes: {},
    sessionAttributes: {}
};

async function ddbPut(id, responseAndAnswer, sentimentObj) {
    let params1 = {
        TableName: process.env.TABLE_NAME,
        Key: {
            session_id: id
        }
    }
    try {
        let data = await docClient.get(params1).promise();
        if (!data.Item) {
            let messageWithSentiment = responseAndAnswer;
            messageWithSentiment.sentiment = sentimentObj;
            let params2 = {
                TableName: process.env.TABLE_NAME,
                Item: {
                    session_id: id,
                    created_at: Date.now() + '',
                    arrayOfQA: [messageWithSentiment]
                }
            };
            try {
                await docClient.put(params2).promise();
            } catch (err) {
                console.log('something not good ~ 2', err);
            };
        } else {
            ddbUpdate(id, responseAndAnswer, sentimentObj, data.Item);
        }
    } catch (err) {
        console.log('something not good  ~ 1', err);
    }
};

async function ddbUpdate(id, responseAndAnswer, sentimentObj, currentRow) {
    let messageWithSentiment = responseAndAnswer;
    messageWithSentiment.sentiment = sentimentObj;
    let newArray = currentRow.arrayOfQA;
    newArray.push(messageWithSentiment);
    let params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            session_id: id
        },
        UpdateExpression: `set #array = :new_array`,
        ExpressionAttributeNames: {'#array' : 'arrayOfQA'},
        ExpressionAttributeValues: {
            ':new_array': newArray
        }
    };
    try {
        await docClient.update(params).promise();
    } catch (err) {
        console.log('something not good ~ 3', err);
    };
};

function handleMessage(id, responseAndAnswer) {
    return new Promise((resolve, reject) => {
        var params = {
            botName: "drebin",
            botAlias: "latent_space",
            inputText: responseAndAnswer.message,
            userId: id,
            requestAttributes: {},
            sessionAttributes: {}
        };

        lex.postText(params, function(err, data) {
            if (err) {
                console.log('lex error... uh oh', err, err.stack);
                resolve({success: false, message: 'something went wrong.... teeehee :3'});
            } else {
                // TODO: insert into dynamodb (use socket.lexId as the primary partition key)
                ddbPut(id, responseAndAnswer, data.sentimentResponse);
                // TODO: the result also returns the slot values (eg, name, interest, etc...) > when uploading to database create a property for these slots
                console.log(data.sentimentResponse);
                resolve({success: true, sentiment: data.sentimentResponse});
            }
        });

    });
};

function rando(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = {
    handleMessage,
    rando
};
