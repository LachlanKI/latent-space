(() => {

    // vars
    let paused = true;
    let logo = document.getElementById('logo');
    let runway = document.getElementById('runway');
    let background = document.getElementById('background');
    let end = document.getElementById('end');
    let input = document.getElementsByTagName("input")[0];
    let send = document.getElementById("send");
    let ta = document.getElementsByTagName('textarea')[0];
    let response = document.getElementById('response');
    autosize(ta);
    let lastMessage = null;
    let thinkingArr = ['.', '. .', '. . .'];
    let thinkingCount = 0;
    let thinkingInt;
    let sentimentObj = {
        positive: 0,
        neutral: 0,
        negative: 0
    }
    let sentimentOverall = null;
    let enterButton = document.getElementById("enter-button");
    let infoWrapper = document.getElementById("info-wrapper");
    let contentWrapper = document.getElementById("content-wrapper");
    let firstEnter = false;

    let whichConvo;
    let convoPos = 0;
    let conversations = {
        1: [
                {
                    q: 'How do you define creativity?',
                    type: '3max',
                    options: null
                },
                {
                    q: 'Do you think we can still create anything new or original?',
                    type: 'option',
                    options: ['Yes', 'No', 'Not sure']
                },
                {
                    q: 'How do you differentiate between creativity and imagination?',
                    type: 'free',
                    options: null
                },
                {
                    q: 'How do you define imagination?',
                    type: '3max',
                    options: null
                },
                {
                    q: 'What part of the creative process do you find most challenging?',
                    type: 'free',
                    options: null
                }
            ],
        2: [
                {
                    q: 'Can AI be creative?',
                    type:'option',
                    options: ['Yes', 'No', 'Not sure']
                },
                {
                    q: 'Can AI be as creative as humans?',
                    type: 'free',
                    options: null
                },
                {
                    q: 'Do you think AI can have imagination?',
                    type: 'option',
                    options: ['Yes', 'No', 'Not sure']
                },
                {
                    q: 'Do you think AI should be used in the creative sphere?',
                    type: 'option',
                    options: ['Yes', 'No', 'Not sure']
                },
                {
                    q: 'How do you feel about AI being used in the creative sphere?',
                    type: 'option',
                    options: ['😍', '🤔', '😡']
                },
                {
                    q: 'Do you think AI can benefit human creativity?',
                    type: 'free',
                    options: 'null'
                }
            ],
        3: [
            {
                q: 'Have you ever (intentionally) worked with AI?',
                type: 'option',
                options: ['Yes', 'No', 'Not sure']
            },
            {
                q:'Why have / haven’t you?',
                type: 'free',
                options: null
            },
            {
                q: 'Would you want to work with AI creatively?',
                type: 'option',
                options: ['😍', '🤔', '😡']
            },
            {
                q: 'Would you know how to use AI in your creative process?',
                type: 'option',
                options: ['Yes', 'No', 'Not sure']
            },
            {
                q: 'What appeals / doesn’t appeal to you about working with AI?',
                type: 'free',
                options: null
            },
            {
                q: 'Have you seen much AI generated/aided work?',
                type: 'free',
                options: null
            },
            {
                q: 'How do you feel about AI generated/aided work?',
                type: 'option',
                options: ['😍', '🤔', '😡']
            }
        ]
    }

    // functions
    function responseReceived(sentiment) {
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
        console.log(sentimentObj, sentimentOverall);
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
            response.innerText = conversations[whichConvo][convoPos].q;
            setTimeout(() => {
                response.style.display = 'block';
            }, 100);
        } else {
            contentWrapper.style.opacity = '0';
            setTimeout(() => {
                end.style.opacity = '1';
            }, 4000);
        };

    }

    function sendMessage(message) {
        console.log('sending this message', message)
        paused = true;
        socket.emit('send_message', message);
    };

    function inputEvent(e, type) {
        if (e.type === 'keydown' && e.keyCode === 13 || type === 'button') {
            if (paused) return;
            if (!ta.value || !ta.value.length || /^\s+$/.test(ta.value)) return;
            let question = response.innerText
                .replace(/\s+/g, " ")
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                .trim();
            let message = ta.value
                .replace(/\s+/g, " ")
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                .trim();
            lastMessage = message;
            thinkingInt = setInterval(thinking, 250);
            sendMessage({  question, message });
            setTimeout(() => {
                ta.placeholder = '';
                ta.value = '';
                ta.style.height = '20px';
            }, 30);
        };
    };

    function moveSend() {
        if (window.innerWidth < 500) {
            send.style.right = `${(window.innerWidth * 0.1) - 3}px`;
        };
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
            whichConvo = rando(3, 1);
            response.innerText = conversations[whichConvo][0].q;
            setTimeout(() => {
                response.style.display = 'block';
            }, 3500);
            firstEnter = true;
        };
    };

    // event_listeners
    document.addEventListener('keydown', (e) => inputEvent(e, 'enter'));
    send.addEventListener('touchstart', (e) => inputEvent(e, 'button'));
    send.addEventListener('click', (e) => inputEvent(e, 'button'));
    window.addEventListener('resize', moveSend);
    enterButton.addEventListener('click', () => enterEvent(true));
    logo.addEventListener('click', () => enterEvent(false));

    // socket
    // TODO: the socket will need to be changed when it is running of heroku
    // var socket = io.connect("http://localhost:8080");
    // var socket = io.connect("http://192.168.1.158:8080");
    var socket = io.connect("https://latentspace.herokuapp.com/");

    socket.on('hi_there', data => {
        const { message } = data;
        paused = false;
    });

    socket.on('response', data => {
        const { sentiment } = data;
        responseReceived(sentiment);
        paused = false;
    })

    socket.emit('hello');

    // other
    let whichGif = rando(2, 1);
    runway.src = `/assets/runway${whichGif}.gif`;
    background.style.background = `url(/assets/runway${whichGif}.gif) no-repeat center center fixed`;
    background.style.backgroundSize = `cover`;
    if (window.innerWidth > 500) {
        send.style.right = `47px`;
    } else {
        send.style.right = `${(window.innerWidth * 0.1) - 3}px`;
    };


})();
