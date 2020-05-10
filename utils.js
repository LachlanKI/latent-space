const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const lex = new AWS.LexRuntime();
const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const ddb = new AWS.DynamoDB();

// NOTE: this will not work without loading the AWS credentials via a '.env' file located in the root of the project

let params = {
    botAlias: "latent_space",
    botName: "drebin",
    inputText: null,
    userId: null,
    requestAttributes: {},
    sessionAttributes: {}
};

let sentimentScoreRegex = /{Positive: ([\w\.-]+),Negative: ([\w\.-]+),Neutral: ([\w\.-]+),Mixed: ([\w\.-]+)}/;

async function ddbPutC(id, dataObj, sentimentObj) {
    let params1 = {
        TableName: process.env.TABLE_NAME_C,
        Key: {
            session_id: id
        }
    }
    try {
        let data = await docClient.get(params1).promise();
        if (!data.Item) {
            let messageWithSentiment = dataObj;
            messageWithSentiment.sentiment = sentimentObj;
            let params2 = {
                TableName: process.env.TABLE_NAME_C,
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
            await ddbUpdateC(id, dataObj, sentimentObj, data.Item);
        }
    } catch (err) {
        console.log('something not good  ~ 1', err);
    }
};

async function ddbUpdateC(id, dataObj, sentimentObj, currentRow) {
    let messageWithSentiment = dataObj;
    messageWithSentiment.sentiment = sentimentObj;
    let newArray = currentRow.arrayOfQA;
    newArray.push(messageWithSentiment);
    let params = {
        TableName: process.env.TABLE_NAME_C,
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

async function ddbPutQ(ids, question, sentiment) {
    let params1 = {
        TableName: process.env.TABLE_NAME_Q,
        Key: {
            question_id: `${ids.sID}_${ids.qID}`
        }
    };
    try {
        let data = await docClient.get(params1).promise();
        if (!data.Item) {

            let sentimentScoreMatch = null;
            if (sentimentScoreRegex.test(sentiment.sentimentScore)) {
                sentimentScoreMatch = sentiment.sentimentScore.match(sentimentScoreRegex);
            };
            if (!sentimentScoreMatch) {
                return;
            };
            
            let params2 = {
                TableName: process.env.TABLE_NAME_Q,
                Item: {
                    question_id: `${ids.sID}_${ids.qID}`,
                    created_at: Date.now() + '',
                    question: question,
                    times_answered: 1,
                    positive_label_count: /positive/i.test(sentiment.sentimentLabel) ? 1 : 0,
                    negative_label_count: /negative/i.test(sentiment.sentimentLabel) ? 1 : 0,
                    neutral_label_count: /neutral/i.test(sentiment.sentimentLabel) ? 1 : 0,
                    mixed_label_count: /mixed/i.test(sentiment.sentimentLabel) ? 1 : 0,
                    positive_total_score: parseFloat(sentimentScoreMatch[1]), 
                    negative_total_score: parseFloat(sentimentScoreMatch[2]),
                    neutral_total_score: parseFloat(sentimentScoreMatch[3]),
                    mixed_total_score: parseFloat(sentimentScoreMatch[4])
                }
            };

            try {
                await docClient.put(params2).promise();
            } catch (err) {
                console.log('something not good ~ 5');
            }
        } else {
            await ddbUpdateQ(ids, sentiment, data.Item);
        };
    } catch (err) {
        console.log('something not good ~ 4', err);
    };
};

async function ddbUpdateQ(ids, sentiment, currentQuestion) {

    let sentimentScoreMatch = null;
    if (sentimentScoreRegex.test(sentiment.sentimentScore)) {
        sentimentScoreMatch = sentiment.sentimentScore.match(sentimentScoreRegex);
    };
    if (!sentimentScoreMatch) {
        return;
    };

    let params = {
        TableName: process.env.TABLE_NAME_Q,
        Key: {
            question_id: `${ids.sID}_${ids.qID}`
        },
        UpdateExpression: `set #ta = :ta, #plc = :plc, #nglc = :nglc, #ntlc = :ntlc, #mlc = :mlc, #pts = :pts, #ngts = :ngts, #ntts = :ntts, #mts = :mts`,
        ExpressionAttributeNames: {
            '#ta': 'times_answered',
            '#plc': 'positive_label_count',
            '#nglc': 'negative_label_count',
            '#ntlc': 'neutral_label_count',
            '#mlc': 'mixed_label_count',
            '#pts': 'positive_total_score',
            '#ngts': 'negative_total_score',
            '#ntts': 'neutral_total_score',
            '#mts': 'mixed_total_score',
        },
        ExpressionAttributeValues: {
            ':ta': currentQuestion.times_answered + 1,
            ':plc': /positive/i.test(sentiment.sentimentLabel) ? currentQuestion.positive_label_count + 1 : currentQuestion.positive_label_count,
            ':nglc': /negative/i.test(sentiment.sentimentLabel) ? currentQuestion.negative_label_count + 1 : currentQuestion.negative_label_count,
            ':ntlc': /neutral/i.test(sentiment.sentimentLabel) ? currentQuestion.neutral_label_count + 1 : currentQuestion.neutral_label_count,
            ':mlc': /mixed/i.test(sentiment.sentimentLabel) ? currentQuestion.mixed_label_count + 1 : currentQuestion.mixed_label_count,
            ':pts': currentQuestion.positive_total_score + parseFloat(sentimentScoreMatch[1]),
            ':ngts': currentQuestion.negative_total_score + parseFloat(sentimentScoreMatch[2]),
            ':ntts': currentQuestion.neutral_total_score + parseFloat(sentimentScoreMatch[3]),
            ':mts': currentQuestion.mixed_total_score + parseFloat(sentimentScoreMatch[4])
        }
    };

    try {
        await docClient.update(params).promise();
    } catch (err) {
        console.log('something not good ~ 6', err);
    };
};

async function fetchGlobalValues() {
    let params = {
        TableName: process.env.TABLE_NAME_GLOBAL,
        Key: {
            id: 'global_values'
        },
        ProjectionExpression: '#nqa, #plc, #nglc, #ntlc, #mlc, #pts, #ngts, #ntts, #mts',
        ExpressionAttributeNames: {
            '#nqa': 'no_questions_answered',
            '#plc': 'positive_label_count',
            '#nglc': 'negative_label_count',
            '#ntlc': 'neutral_label_count',
            '#mlc': 'mixed_label_count',
            '#pts': 'positive_total_score',
            '#ngts': 'negative_total_score',
            '#ntts': 'neutral_total_score',
            '#mts': 'mixed_total_score',
        }
    };
    
    let paramsx = {
        TableName: process.env.TABLE_NAME_C
    };

    try {
        let currentGlobalStats = await docClient.get(params).promise();
        let tableData = await ddb.describeTable(paramsx).promise();
        currentGlobalStats.Item.no_sessions = tableData.Table.ItemCount;
        return {
            success: true,
            data: currentGlobalStats.Item
        };
    } catch (err) {
        console.log('something not good ~ globalls1', err);
        return {success: false};
    };
};

async function ddbUpdateGlobal(sentiment) {

    let sentimentScoreMatch = null;
    if (sentimentScoreRegex.test(sentiment.sentimentScore)) {
        sentimentScoreMatch = sentiment.sentimentScore.match(sentimentScoreRegex);
    };
    if (!sentimentScoreMatch) {
        return;
    };

    let fetchGlobalResult = await fetchGlobalValues();

    if (!fetchGlobalResult.success) return;
    
    console.log('we go the current stats!', fetchGlobalResult.data);

    let params = {
        TableName: process.env.TABLE_NAME_GLOBAL,
        Key: {
            id: 'global_values'
        },
        UpdateExpression: `set #nqa = :nqa, #plc = :plc, #nglc = :nglc, #ntlc = :ntlc, #mlc = :mlc, #pts = :pts, #ngts = :ngts, #ntts = :ntts, #mts = :mts`,
        ExpressionAttributeNames: {
            '#nqa': 'no_questions_answered',
            '#plc': 'positive_label_count',
            '#nglc': 'negative_label_count',
            '#ntlc': 'neutral_label_count',
            '#mlc': 'mixed_label_count',
            '#pts': 'positive_total_score',
            '#ngts': 'negative_total_score',
            '#ntts': 'neutral_total_score',
            '#mts': 'mixed_total_score',
        },
        ExpressionAttributeValues: {
            ':nqa': fetchGlobalResult.data.no_questions_answered + 1,
            ':plc': /positive/i.test(sentiment.sentimentLabel) ? fetchGlobalResult.data.positive_label_count + 1 : fetchGlobalResult.data.positive_label_count,
            ':nglc': /negative/i.test(sentiment.sentimentLabel) ? fetchGlobalResult.data.negative_label_count + 1 : fetchGlobalResult.data.negative_label_count,
            ':ntlc': /neutral/i.test(sentiment.sentimentLabel) ? fetchGlobalResult.data.neutral_label_count + 1 : fetchGlobalResult.data.neutral_label_count,
            ':mlc': /mixed/i.test(sentiment.sentimentLabel) ? fetchGlobalResult.data.mixed_label_count + 1 : fetchGlobalResult.data.mixed_label_count,
            ':pts': fetchGlobalResult.data.positive_total_score + parseFloat(sentimentScoreMatch[1]),
            ':ngts': fetchGlobalResult.data.negative_total_score + parseFloat(sentimentScoreMatch[2]),
            ':ntts': fetchGlobalResult.data.neutral_total_score + parseFloat(sentimentScoreMatch[3]),
            ':mts': fetchGlobalResult.data.mixed_total_score + parseFloat(sentimentScoreMatch[4])
        }
    };

    try {
        await docClient.update(params).promise();
    } catch (err) {
        console.log('something not good ~ globalls2', err);
    };
};

function handleMessage(id, dataObj) {
    return new Promise((resolve, reject) => {
        var params = {
            botName: "drebin",
            botAlias: "latent_space",
            inputText: dataObj.message,
            userId: id,
            requestAttributes: {},
            sessionAttributes: {}
        };

        lex.postText(params, function(err, data) {
            if (err) {
                console.log('lex error... uh oh', err, err.stack);
                resolve({success: false, message: 'something went wrong.... teeehee :3'});
            } else {

                (async () => {
                    await ddbPutC(id, dataObj, data.sentimentResponse);
                    resolve({success: true, sentiment: data.sentimentResponse});
                    ddbPutQ(dataObj.ids, dataObj.question, data.sentimentResponse);
                    ddbUpdateGlobal(data.sentimentResponse);
                })();
            
            };
        });

    });
};

async function getQuestionStats(ids) {
    return new Promise((resolve, reject) => {
        let params1 = {
            TableName: process.env.TABLE_NAME_Q,
            Key: {
                question_id: `${ids.sID}_${ids.qID}`
            },
            ProjectionExpression: '#q, #ta, #plc, #nglc, #ntlc, #mlc, #pts, #ngts, #ntts, #mts',
            ExpressionAttributeNames: {
                '#q': 'question',
                '#ta': 'times_answered',
                '#plc': 'positive_label_count',
                '#nglc': 'negative_label_count',
                '#ntlc': 'neutral_label_count',
                '#mlc': 'mixed_label_count',
                '#pts': 'positive_total_score',
                '#ngts': 'negative_total_score',
                '#ntts': 'neutral_total_score',
                '#mts': 'mixed_total_score',
            }
        };

        try {
            docClient.get(params1).promise().then(data => {
                if (!data.Item) {
                    resolve({success: false});
                } else {
                    resolve({success: true, data: data.Item});
                }
            });
        } catch (err) {
            console.log('something not good ~ 7', err);
        }
    });
};

function rando(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function getAllQuestionStatistics() {
    return new Promise((resolve, reject) => {
        let data = [];
        function recursion(lastEvaluatedKey) {
            let params = {
                TableName: process.env.TABLE_NAME_Q,
                ExclusiveStartKey: lastEvaluatedKey ? lastEvaluatedKey : null,
                Limit: 50
            };
            try {
                docClient.scan(params).promise().then(result => {
                    data = [...data, ...result.Items];
                    if (result.LastEvaluatedKey) {
                        recursion(result.LastEvaluatedKey)
                    } else {
                        resolve({
                            success: true,
                            data
                        });
                    };
                });
            } catch (error) {
                resolve({
                    success: false
                });
            };
        };
        recursion();
    });
};

function getAllConversations() {
    return new Promise((resolve, reject) => {
        let data = [];
        function recursion(lastEvaluatedKey) {
            let params = {
                TableName: process.env.TABLE_NAME_C,
                ExclusiveStartKey: lastEvaluatedKey ? lastEvaluatedKey : null,
                Limit: 50
            };
            try {
                docClient.scan(params).promise().then(result => {
                    data = [...data, ...result.Items];
                    if (result.LastEvaluatedKey) {
                        recursion(result.LastEvaluatedKey)
                    } else {
                        resolve({
                            success: true,
                            data
                        });
                    };
                });
            } catch (error) {
                resolve({
                    success: false
                });
            };
        };
        recursion();
    });
};

module.exports = {
    handleMessage,
    getQuestionStats,
    fetchGlobalValues,
    rando,
    getAllQuestionStatistics,
    getAllConversations
};
