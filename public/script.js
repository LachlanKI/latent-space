(() => {

    // vars
    let paused = true;
    let logo = document.getElementById('logo');
    let end = document.getElementById('end');
    let input = document.getElementsByTagName("input")[0];
    let send = document.getElementById("send");
    let ta = document.getElementsByTagName('textarea')[0];
    let response = document.getElementById('response');
    autosize(ta);
    let runway = document.getElementById('runway');
    let background = document.getElementById('background');
    // let lastMessage = null;
    let thinkingArr = ['.', '. .', '. . .'];
    let thinkingCount = 0;
    let thinkingInt;
    let sentimentObj = {
        positive: 0,
        neutral: 0,
        negative: 0
    }
    let sentimentOverall = null;
    let stats = document.getElementById("stats");
    let enterButton = document.getElementById("enter-button");
    let infoWrapper = document.getElementById("info-wrapper");
    let contentWrapper = document.getElementById("content-wrapper");
    let inputWrap = document.getElementById("inputWrap");
    let optionsWrap = document.getElementById("optionsWrap");
    let optionsButtons = document.getElementsByClassName('options');
    let currentResponseType = null;
    let firstEnter = false;
    let pastConvos = [];
    let whichConvo;
    let convoPos = 0;
    let countdownVal = 5;
    let countdownInt;
    let conversations = {
        1: [
            {
                q: "How do you define creativity?",
                type: "3max",
                options: null,
                sID: 1,
                qID: 1,
            },
            {
                q: "Do you think we can still create anything new or original?",
                type: "option",
                options: ["Yes", "No", "Not sure"],
                sID: 1,
                qID: 2,
            },
            {
                q:
                    "How do you differentiate between creativity and imagination?",
                type: "free",
                options: null,
                sID: 1,
                qID: 3,
            },
            {
                q: "How do you define imagination?",
                type: "3max",
                options: null,
                sID: 1,
                qID: 4,
            },
            {
                q:
                    "What part of the creative process do you find most challenging?",
                type: "free",
                options: null,
                sID: 1,
                qID: 5,
            },
        ],
        2: [
            {
                q: "Can AI be creative?",
                type: "option",
                options: ["Yes", "No", "Not sure"],
                sID: 2,
                qID: 1,
            },
            {
                q: "Can AI be as creative as humans?",
                type: "free",
                options: null,
                sID: 2,
                qID: 2,
            },
            {
                q: "Do you think AI can have imagination?",
                type: "option",
                options: ["Yes", "No", "Not sure"],
                sID: 2,
                qID: 3,
            },
            {
                q: "Do you think AI should be used in the creative sphere?",
                type: "option",
                options: ["Yes", "No", "Not sure"],
                sID: 2,
                qID: 4,
            },
            {
                q:
                    "How do you feel about AI being used in the creative sphere?",
                type: "option",
                options: ["😍", "😡", "🤔"],
                sID: 2,
                qID: 5,
            },
            {
                q: "Do you think AI can benefit human creativity?",
                type: "free",
                options: "null",
                sID: 2,
                qID: 6,
            },
        ],
        3: [
            {
                q: "Have you ever (intentionally) worked with AI?",
                type: "option",
                options: ["Yes", "No", "Not sure"],
                sID: 3,
                qID: 1,
            },
            {
                q: "Why have / haven’t you?",
                type: "free",
                options: null,
                sID: 3,
                qID: 2,
            },
            {
                q: "Would you want to work with AI creatively?",
                type: "option",
                options: ["😍", "😡", "🤔"],
                sID: 3,
                qID: 3,
            },
            {
                q: "Would you know how to use AI in your creative process?",
                type: "option",
                options: ["Yes", "No", "Not sure"],
                sID: 3,
                qID: 4,
            },
            {
                q:
                    "What appeals / doesn’t appeal to you about working with AI?",
                type: "free",
                options: null,
                sID: 3,
                qID: 5,
            },
            {
                q: "Have you seen much AI generated/aided work?",
                type: "free",
                options: null,
                sID: 3,
                qID: 6,
            },
            {
                q: "How do you feel about AI generated/aided work?",
                type: "option",
                options: ["😍", "😡", "🤔"],
                sID: 3,
                qID: 7,
            },
        ]
    };

    // functions
    function responseReceived(sentiment) {
        fetchStats(conversations[whichConvo][convoPos].sID, conversations[whichConvo][convoPos].qID);
        if (sentiment.sentimentLabel === 'POSITIVE') {
            sentimentObj.positive++;
            background.style.filter = `hue-rotate(200deg)`;
        } else if (sentiment.sentimentLabel === 'NEUTRAL') {
            sentimentObj.neutral++;
            background.style.filter = `hue-rotate(0deg)`;
        } else if (sentiment.sentimentLabel === 'NEGATIVE') {
            sentimentObj.negative++;
            background.style.filter = `hue-rotate(-200deg)`;
        };
        sentimentOverall = Object.keys(sentimentObj).reduce((positive, negative) => sentimentObj[positive] > sentimentObj[negative] ? positive : negative);
        console.log('XXX', sentimentOverall);
        if (sentimentOverall === 'positive') {
            runway.style.filter = `hue-rotate(200deg)`;
        } else if (sentimentOverall === 'neutral') {
            runway.style.filter = `hue-rotate(0deg)`;
        } else if (sentimentOverall === 'negative') {
            runway.style.filter = `hue-rotate(-200deg)`;
        };

        clearInterval(thinkingInt);
        response.style.display = 'none';
        convoPos++;
        if (convoPos <= conversations[whichConvo].length - 1) {
            currentResponseType = conversations[whichConvo][convoPos].type;
            responseSetup(false);
            response.innerText = conversations[whichConvo][convoPos].q;
            setTimeout(() => {
                response.style.display = 'block';
            }, 100);
        } else {
            if (pastConvos.length === 3) {
                console.log('all convos done bo$$');
                end.children[0].innerText = '😃';
                end.children[0].style.border = 'none';
                end.children[0].style.fontSize = '60px';
            };
            contentWrapper.style.opacity = '0';
            end.style.display = 'flex';
            setTimeout(() => {
                ta.value = '';
                end.style.opacity = '1';
            }, 4000);
        };

    };

    function sendMessage(message) {
        stats.style.display = 'none';
        console.log('sending this message', message)
        paused = true;
        socket.emit('send_message', message);
    };

    function inputEvent(e) {
        if (paused) return;
        if (e.type === 'keydown' && e.keyCode !== 13) return;
        let question, message;
        const { sID, qID  } = conversations[whichConvo][convoPos];
        let ids = {
            sID,
            qID
        };
        if (currentResponseType === 'free' || currentResponseType === '3max') {
            if (!ta.value || !ta.value.length || /^\s+$/.test(ta.value)) return;
            question = response.innerText
                .replace(/\s+/g, " ")
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                .trim();
            message = ta.value
                .replace(/\s+/g, " ")
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                .trim();
        } else if (currentResponseType === 'option') {
            question = response.innerText
                .replace(/\s+/g, " ")
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                .trim();
            if (e.target.innerText === 'YES' || e.target.innerText === '😍') {
                if (e.target.innerText === 'YES') {
                    message = 'amazing 1337x';
                } else {
                    message = 'happy 1337x';
                };
            } else if (e.target.innerText === 'NO' || e.target.innerText === '😡') {
                if (e.target.innerText === 'NO') {
                    message = 'hate 1337x';
                } else {
                    message = 'negative 1337x';
                };
            } else if (e.target.innerText === 'NOT SURE' || e.target.innerText === '🤔') {
                if (e.target.innerText === 'NOT SURE') {
                    message = 'ok 1337x';
                } else {
                    message = 'sure 1337x';
                };
            };
        };
        thinkingInt = setInterval(thinking, 250);
        sendMessage({ids, question, message});
        setTimeout(() => {
            if (currentResponseType === 'free' || currentResponseType === '3max') {
                ta.placeholder = '';
                ta.value = '';
                ta.style.height = '20px';
            };
        }, 30);
    };

    function thinking() {
        response.innerText = thinkingArr[thinkingCount];
        thinkingCount += 1;
        if (thinkingCount === 3) {
            thinkingCount = 0;
        };
    };

    function rando(max, min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    function start() {
        console.log('start');
        whichConvo = rando(3, 1);
        for (var i = 0; i < pastConvos.length; i++) {
            if (whichConvo === pastConvos[i]) {
                start();
                return;
            };
        };
        pastConvos.push(whichConvo);
        console.log(pastConvos);
        response.innerText = conversations[whichConvo][0].q;
        currentResponseType = conversations[whichConvo][0].type;
        responseSetup(true);
        setTimeout(() => {
            response.style.display = 'block';
        }, 3500);
        firstEnter = true;
    };

    function enterEvent(direction) {
        infoWrapper.style.transform = direction ? 'rotateY(180deg) translateZ(1px)' : 'rotateY(0deg) translateZ(1px)';
        infoWrapper.style.zIndex = direction ? 0 : 1;
        infoWrapper.style.opacity = direction ? 0 : 1;
        infoWrapper.style.pointerEvents = direction ? 'none' : 'auto';
        contentWrapper.style.transform = direction ? 'rotateY(360deg)' : 'rotateY(180deg)';
        contentWrapper.style.zIndex = direction ? 1 : 0;
        contentWrapper.style.opacity = direction ? 1 : 0;
        contentWrapper.style.pointerEvents = direction ? 'auto' : 'none';
        if (!firstEnter) {
            start();
        };
    };

    function responseSetup(first) {
        if (currentResponseType === 'option') {
            for (var i = 0; i < optionsButtons.length; i++) {
                optionsButtons[i].innerText = conversations[whichConvo][convoPos].options[i];
            };
            ta.style.display = 'none';
            send.style.opacity = '0';
            send.style.pointerEvents = 'none';
            optionsWrap.style.display = 'flex';
            var delay = first ? 3500 : 50;
            setTimeout(() => optionsWrap.style.opacity = '1', delay);
        } else {
            optionsWrap.style.display = 'none';
            ta.style.display = 'block';
            send.style.opacity = '1';
            send.style.pointerEvents = 'auto';
        };
    };

    function fetchStats(x, y) {
        socket.emit('fetch_question_stats', {ids: {sID: x, qID: y}});
    };

    function countdown() {
        end.children[0].style.border = 'none';
        end.children[0].style.fontSize = '60px';
        end.children[0].style.pointerEvents = 'none';
        end.children[0].innerText = countdownVal;
        countdownVal--;
        if (countdownVal === 0) {
            convoPos = 0;
            contentWrapper.style.opacity = '1';
            end.style.opacity = '0';
            setTimeout(() => {
                end.style.display = 'none';
                end.children[0].innerText = 'new conversation?';
                end.children[0].style.border = '3px solid white';
                end.children[0].style.fontSize = '20px';
                end.children[0].style.pointerEvents = 'auto';
                countdownVal = 5;
            }, 4000);
            start();
            clearInterval(countdownInt);
        };
    };

    function restart() {
        if (pastConvos.length === 3) {
            console.log('download');
            var frame = rub.get_current_frame();
        } else {
            countdownInt = setInterval(countdown, 1000);
        };
    };



    // event_listeners
    document.addEventListener('keydown', (e) => inputEvent(e));
    send.addEventListener('touchstart', (e) => inputEvent(e));
    send.addEventListener('click', (e) => inputEvent(e));
    end.children[0].addEventListener('click', () => restart());
    enterButton.addEventListener('click', () => enterEvent(true));
    logo.addEventListener('click', () => enterEvent(false));
    for (var i = 0; i < optionsButtons.length; i++) {
        optionsButtons[i].addEventListener('click', (e) => inputEvent(e));
    }

    // socket
    // TODO: the socket will need to be changed when it is running of heroku
    // var socket = io.connect("http://localhost:8080");
    // var socket = io.connect("http://192.168.0.73:8080");
    var socket = io.connect("https://latentspace.herokuapp.com/");

    socket.on('hi_there', data => {
        const { message } = data;
        paused = false;
    });

    socket.on('response', data => {
        const { sentiment } = data;
        responseReceived(sentiment);
        paused = false;
    });

    // question stat response
    socket.on('q_response', data => {
        console.log('q_response', data);
        var percentageStats = {
            positive: (data.data.positive_label_count / data.data.times_answered * 100).toFixed(1),
            neutral: (data.data.neutral_label_count / data.data.times_answered * 100).toFixed(1),
            negative: (data.data.negative_label_count / data.data.times_answered * 100).toFixed(1)
        };
        stats.innerText = `😍 ${percentageStats.positive}%
                            😡 ${percentageStats.negative}%
                            🤔 ${percentageStats.neutral}%`
        stats.style.display = 'flex';
    });

    socket.on('global_response', data => {
        console.log('global_response', data);
    })

    socket.emit('hello');
    // how to fetch global data
    socket.emit('fetch_global_values');

    // other
    let whichGif = rando(2, 1);
    // runway.src = `/assets/runway${whichGif}.gif`;
    background.style.background = `url(/assets/runway${whichGif}.gif) no-repeat center center fixed`;
    background.style.backgroundSize = `cover`;
    setTimeout(() => {
        infoWrapper.style.opacity = '1';
    }, 600);

})();
