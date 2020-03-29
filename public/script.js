(() => {

    // vars
    let paused = true;
    let runway = document.getElementById('runway');
    let background = document.getElementById('background');
    let input = document.getElementsByTagName("input")[0];
    let send = document.getElementById("send");
    let ta = document.getElementsByTagName('textarea')[0];
    let response = document.getElementById('response');
    autosize(ta);
    let lastMessage = null;
    // var hue = 0;
    let thinkingArr = ['.', '. .', '. . .'];
    let thinkingCount = 0;
    let thinkingInt;
    let questions = {
        creativity: ['How do you define creativity?', 'Should AI be used in the creative sphere?', 'Will AI be able to create in the same way as us?', 'How would you define creativity?', 'Have you ever worked with AI in your creative practice?', 'Do you work with digital?', 'Would you work with AI?', 'Can AI be creative?', 'Have you seen any AI artwork?', 'Do you think AI has imagination?', 'Have you ever worked with AI?'],
        fear: ['Are people more scared about the climate crisis or technology?']
    }
    let sentimentObj = {
        positive: 0,
        neutral: 0,
        negative: 0
    }
    let sentimentOverall = null;
    let enterButton = document.getElementById("enter-button");
    let infoWrapper = document.getElementById("info-wrapper");
    let contentWrapper = document.getElementById("content-wrapper");

    setTimeout(() => {
        response.style.display = 'block';
    }, 800);

    // functions

    function responseReceived(sentiment) {
        // console.log(sentiment.sentimentScore);
        if (sentiment.sentimentLabel === 'POSITIVE') {
            // hue += 20;
            sentimentObj.positive++;
            runway.style.filter = `hue-rotate(200deg)`;
        } else if (sentiment.sentimentLabel === 'NEUTRAL') {
            // hue -= 20;
            sentimentObj.neutral++;
            runway.style.filter = `hue-rotate(0deg)`;
        } else if (sentiment.sentimentLabel === 'NEGATIVE') {
            // hue -= 20;
            sentimentObj.negative++;
            runway.style.filter = `hue-rotate(-200deg)`;
        };
        sentimentOverall = Object.keys(sentimentObj).reduce((positive, negative) => sentimentObj[positive] > sentimentObj[negative] ? positive : negative);
        console.log(sentimentObj, sentimentOverall);
        if (sentimentOverall === 'positive') {
            background.style.filter = `hue-rotate(200deg)`;
        } else if (sentimentOverall === 'neutral') {
            background.style.filter = `hue-rotate(0deg)`;
        } else if (sentimentOverall === 'negative') {
            background.style.filter = `hue-rotate(-200deg)`;
        }
        clearInterval(thinkingInt);
        response.style.display = 'none';
        // response.innerText = message;

        if (lastMessage.includes('hey') || lastMessage.includes('heya') || lastMessage.includes('hello') || lastMessage.includes('hi')) {
            response.innerText = questions.creativity[rando(questions.creativity.length - 1, 0)];
        } else {
            response.innerText = 'sorry can you please repeat that?';
        };

        setTimeout(() => {
            response.style.display = 'block';
        }, 100);
    }

    function sendMessage(message) {
        console.log('sending this message', message)
        paused = true;
        socket.emit('send_message', message);
    };

    function inputEvent(e, type) {
        // console.log('here boi', type, e.keyCode);
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

    function enterEvent() {
        console.log('enter event');
        infoWrapper.style.transform = 'rotateY(180deg) translateZ(1px)';
        infoWrapper.style.zIndex = 0;
        infoWrapper.style.opacity = 0;
        infoWrapper.style.pointerEvents = 'none';
        contentWrapper.style.transform = 'rotateY(360deg)';
        contentWrapper.style.zIndex = 1;
        contentWrapper.style.opacity = 1;
        infoWrapper.style.pointerEvents = 'none';
    };

    // event_listeners
    document.addEventListener('keydown', (e) => inputEvent(e, 'enter'));
    send.addEventListener('touchstart', (e) => inputEvent(e, 'button'));
    send.addEventListener('click', (e) => inputEvent(e, 'button'));
    window.addEventListener('resize', moveSend);
    enterButton.addEventListener('click', enterEvent);

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
    var whichGif = rando(2, 1);
    runway.src = `/assets/runway${whichGif}.gif`;
    background.style.background = `url(/assets/runway${whichGif}.gif) no-repeat center center fixed`;
    background.style.backgroundSize = `cover`;
    if (window.innerWidth > 500) {
        send.style.right = `47px`;
    } else {
        send.style.right = `${(window.innerWidth * 0.1) - 3}px`;
    };

    // chat


})();
