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

    function toDataURL(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    };

    function restart() {
        if (pastConvos.length === 3) {
            console.log('download');
            var frame = rub.get_current_frame();
            toDataURL(`/assets/gifimgs/${whichGif}/runway${frame}.jpeg`, function(dataUrl) {
                console.log('RESULT:', dataUrl);
                var imgData = dataUrl;
                var doc = new jsPDF();

                doc.setFontSize(40);
                doc.text(35, 25, 'sean john');
                doc.addImage(imgData, 'JPEG', 15, 40, 180, 160);
                doc.save(`latent_space(${whichGif}/${frame})mostly=${sentimentOverall}_kesInkersoleXavd.pdf`);
            });
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

    var rub = new SuperGif({ gif: runway } );
    rub.load(() => {
        console.log('loaded bb');
        var frame = rub.get_current_frame();

    });

    var smile;

    toDataURL(`/assets/gifimgs/${whichGif}/runway15.jpeg`, function(dataUrl) {
        var imgData = dataUrl;
        var doc = new jsPDF('p', 'pt', [500, 500]);
        doc.addImage(imgData, 'JPEG', 0, 0, 500, 500);
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica');
        doc.text(5, 30, `latent_space`);
        doc.text(5, 55, `GAN_${whichGif}`);
        doc.text(5, 80, `frame_15`);
        doc.text(5, 105, `global_sentiment_${sentimentOverall}`);
        doc.text(5, 130, `created_by_kes_inkersole`);
        doc.text(5, 155, `built_by_avd`);
        doc.addImage(smile, 'PNG', 380, 400, 60, 60);
        doc.save(`latent_space(${whichGif}/15)mostly=${sentimentOverall}_kesInkersoleXavd.pdf`);
    });

    smile = 'data:image/png;base64,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';

})();
