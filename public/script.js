(() => {

    // vars
    let paused = true;
    var runway = document.getElementById('runway');
    let input = document.getElementsByTagName("input")[0];
    let send = document.getElementById("send");
    var ta = document.getElementsByTagName('textarea')[0];
    autosize(ta);
    var response = document.getElementById('response');
    var lastMessage = null;

    setTimeout(() => {
        response.style.display = 'block';
    }, 800);

    // functions

    function responseReceived(sentiment) {
        console.log(sentiment);
        response.style.display = 'none';
        // response.innerText = message;
        // setTimeout(() => {
        //     response.style.display = 'block';
        // }, 100);
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
            sendMessage(message);
            setTimeout(() => {
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
    runway.src = `/assets/runway${rando(2, 1)}.gif`;
    if (window.innerWidth > 500) {
        send.style.right = `47px`;
    } else {
        send.style.right = `${(window.innerWidth * 0.1) - 3}px`;
    };

    // chat


})();
