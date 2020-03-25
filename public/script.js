(() => {

    // vars
    let paused = true;
    var runway = document.getElementById('runway');
    let input = document.getElementsByTagName("input")[0];
    let send = document.getElementById("send");
    var ta = document.getElementsByTagName('textarea')[0];
    var response = document.getElementById('response');
    autosize(ta);
    var lastMessage = null;
    var hue = 0;
    var thinkingArr = ['.', '. .', '. . .'];
    var thinkingCount = 0;
    var thinkingInt;
    var questions = {
        creativity: ['How do you define creativity?', 'Should AI be used in the creative sphere?']
    }

    setTimeout(() => {
        response.style.display = 'block';
    }, 800);

    // functions

    function responseReceived(sentiment) {
        // console.log(sentiment.sentimentScore);
        if (sentiment.sentimentLabel === 'POSITIVE') {
            hue += 20;
            runway.style.filter = `hue-rotate(${hue}deg)`;
        } else if (sentiment.sentimentLabel === 'NEGATIVE') {
            hue -= 20;
            runway.style.filter = `hue-rotate(${hue}deg)`;
        };
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
        paused = true;
        socket.emit('send_message', message);
    };

    function inputEvent(e, type) {
        if (e.type === 'keydown' && e.keyCode === 13 || type === 'button') {
            if (paused) return;
            if (!ta.value || !ta.value.length || /^\s+$/.test(ta.value)) return;
            let message = ta.value
            .replace(/\s+/g, " ")
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .trim();
            lastMessage = message;
            thinkingInt = setInterval(thinking, 250);
            sendMessage(message);
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
        }
    }

    function thinking() {
        console.log('think');
        response.innerText = thinkingArr[thinkingCount];
        thinkingCount += 1;
        if (thinkingCount === 3) {
            thinkingCount = 0;
        };
        console.log(thinkingCount);
    }

    function rando(max, min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // event_listeners
    document.addEventListener('keydown', (e) => inputEvent(e, 'enter'));
    send.addEventListener('touchstart', (e) => inputEvent(e, 'button'));
    window.addEventListener('resize', moveSend);

    // socket
    // TODO: the socket will need to be changed when it is running of heroku
    // var socket = io.connect("http://localhost:8080");
    var socket = io.connect("http://192.168.1.158:8080");
    // var socket = io.connect("https://latentspace.herokuapp.com/");

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
    runway.src = `/assets/runway${rando(2, 1)}.gif`;
    if (window.innerWidth > 500) {
        send.style.right = `47px`;
    } else {
        send.style.right = `${(window.innerWidth * 0.1) - 3}px`;
    };

    // chat


})();
