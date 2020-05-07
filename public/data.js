let loadingElements = document.getElementsByClassName('loading');

let globalStatisticsLoaded = false;
let questionStatisticsLoaded = false;
let conversationsLoaded = false;

let loadingAnimationCounter = 0;
let loadingAnimationArray = [
    '┌( °益°)┘',
    'ε=┌( °益°)┘',
    'ε=ε=┌( °益°)┘',
    'ε=ε=ε=┌( °益°)┘',
    'ε=ε=ε=ε=┌( °益°)┘',
    'ε=ε=ε=ε=ε=┌( °益°)┘',
    'ε=ε=ε=ε=ε=ε=┌( °益°)┘',
];

let sentimentScoreRegex = /{Positive: ([\w\.-]+),Negative: ([\w\.-]+),Neutral: ([\w\.-]+),Mixed: ([\w\.-]+)}/;

function loadingElementsAnimation() {
    for (let loadingElement of loadingElements) {
        if (loadingElement.classList.contains('global') && globalStatisticsLoaded || loadingElement.classList.contains('questions') && questionStatisticsLoaded || loadingElement.classList.contains('conversations') && conversationsLoaded) {
            loadingElement.innerText = loadingElement.classList.contains('global') ? globalStatisticsLoaded
                                      :loadingElement.classList.contains('questions') ? questionStatisticsLoaded
                                      :loadingElement.classList.contains('conversations') ? conversationsLoaded
                                      : '¿?'
        } else {
            loadingElement.innerText = loadingAnimationArray[loadingAnimationCounter];
        };
    };

    loadingAnimationCounter++;
    loadingAnimationCounter = loadingAnimationCounter === loadingAnimationArray.length ? 0 : loadingAnimationCounter;

    if (globalStatisticsLoaded && questionStatisticsLoaded && conversationsLoaded) {
        window.clearInterval(loadingElementsAnimationSetInterval);
    };
};

let loadingElementsAnimationSetInterval = setInterval(loadingElementsAnimation, 200);

function returnStatElement(name, value, alternate, conversation, conversationAlternate) {
    let p = document.createElement('p');
    if (conversation) {
        p.innerHTML = `${name}: <span class="${conversationAlternate ? 'spanX' : 'spanY'}">${value}</span>`;
        if (alternate) {
            p.className  = 'alternate';
        };
    } else {
        p.innerHTML = `${name}: <span>${value}</span>`;
        if (alternate) {
            p.className  = 'alternate';
        };
    };
    return p;
};

function returnBreak(seperator, alternate) {
    if (seperator) {
        let p = document.createElement('p');
        p.innerHTML = `--`;
        if (alternate) {
            p.className = 'alternate';
        };
        return p;
    } else {
        return document.createElement('br');
    };
}

axios.get('/data-global-stats').then(result => {
    const { success, data } = result.data.result;
    if (!success) {
        globalStatisticsLoaded = 'request failed';
    } else {
        globalStatisticsLoaded = '(๑˃ᴗ˂)ﻭ';
        let globalStatisticsElement = document.getElementById('global-statistics');
        globalStatisticsElement.appendChild(returnStatElement('number of questions answered', data.no_questions_answered));
        globalStatisticsElement.appendChild(returnBreak());
        globalStatisticsElement.appendChild(returnStatElement('positive responses', data.positive_label_count));
        globalStatisticsElement.appendChild(returnStatElement('positive score', data.positive_total_score));
        globalStatisticsElement.appendChild(returnBreak());
        globalStatisticsElement.appendChild(returnStatElement('neutral responses', data.neutral_label_count, true));
        globalStatisticsElement.appendChild(returnStatElement('neutral score', data.neutral_total_score, true));
        globalStatisticsElement.appendChild(returnBreak());
        globalStatisticsElement.appendChild(returnStatElement('negative responses', data.negative_label_count));
        globalStatisticsElement.appendChild(returnStatElement('negative score', data.negative_total_score));
    };
});

axios.get('/data-questions').then(result => {
    const { success, data } = result.data.result;
    if (!success) {
        questionStatisticsLoaded = 'request failed';
    } else {
        questionStatisticsLoaded = '(╯✧▽✧)╯';
        let questionStatisticsElement = document.getElementById('question-statistics');
        let sorted = data.sort((a, b) => a.order - b.order);
        let alternate = false;
        for (const question of sorted) {
            questionStatisticsElement.appendChild(returnStatElement('question id', question.question_id, alternate));
            questionStatisticsElement.appendChild(returnStatElement('question', question.question.replace(/\\/g, '').toLowerCase(), alternate));
            questionStatisticsElement.appendChild(returnStatElement('number of times answered', question.times_answered, alternate));
            questionStatisticsElement.appendChild(returnStatElement('positive responses', question.positive_label_count, alternate));
            questionStatisticsElement.appendChild(returnStatElement('positive score', question.positive_total_score, alternate));
            questionStatisticsElement.appendChild(returnStatElement('neutral responses', question.neutral_label_count, alternate));
            questionStatisticsElement.appendChild(returnStatElement('neutral score', question.neutral_total_score, alternate));
            questionStatisticsElement.appendChild(returnStatElement('negative responses', question.negative_label_count, alternate));
            questionStatisticsElement.appendChild(returnStatElement('negative score', question.negative_total_score, alternate));
            questionStatisticsElement.appendChild(returnBreak());
            alternate = !alternate;
        };
    };
});

axios.get('/data-conversations').then(result => {
    const { success, data } = result.data.result;
    if (!success) {
        conversationsLoaded = 'request failed';
    } else {
        console.log(data);
        conversationsLoaded = '＼(≧▽≦)／';
        let conversationsElement = document.getElementById('conversations');
        let sorted = data.sort((a, b) => b.created_at - a.created_at);
        let alternate = false;
        for (const conversation of sorted) {
            let date = new Date(parseInt(conversation.created_at));
            date = moment(date.toISOString()).format('YYYY/MM/DD HH:mm:ss');
            conversationsElement.appendChild(returnStatElement('time of conversation', date, alternate));
            conversationsElement.appendChild(returnStatElement('conversation id', conversation.session_id, alternate));
            let convoAlternate = false;
            conversationsElement.appendChild(returnBreak(true, alternate));
            for (const questionResponse of conversation.arrayOfQA) {
                conversationsElement.appendChild(returnStatElement('question id', `${questionResponse.ids.sID}_${questionResponse.ids.qID}`, alternate, true, convoAlternate));
                conversationsElement.appendChild(returnStatElement('question', questionResponse.question.replace(/\\/g, '').toLowerCase(), alternate, true, convoAlternate));
                conversationsElement.appendChild(returnStatElement('response', questionResponse.message, alternate, true, convoAlternate));
                conversationsElement.appendChild(returnStatElement('overall sentiment', questionResponse.sentiment.sentimentLabel.toLowerCase(), alternate, true, convoAlternate));
                let sentimentMatch = questionResponse.sentiment.sentimentScore.match(sentimentScoreRegex);
                conversationsElement.appendChild(returnStatElement('sentiment scores', `positive: ${sentimentMatch[1]}, neutral: ${sentimentMatch[3]}, negative: ${sentimentMatch[2]}`, alternate, true, convoAlternate));
                conversationsElement.appendChild(returnBreak());
                convoAlternate = !convoAlternate;
            };
            conversationsElement.appendChild(returnBreak());
            alternate = !alternate;
        };
    };
});