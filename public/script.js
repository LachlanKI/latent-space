(() => {

    // vars
    let paused = true;
    let input = document.getElementsByTagName("input")[0];
    // let button = document.getElementsByTagName("button")[0];
    // let ul = document.getElementsByTagName('ul')[0];
    var ta = document.getElementsByTagName('textarea')[0];
    autosize(ta);
    var response = document.getElementById('response');

    setTimeout(() => {
        response.style.display = 'block';
    }, 800);

    // functions

    function responseReceived(message) {
        response.style.display = 'none';
        response.innerText = message;
        setTimeout(() => {
            response.style.display = 'block';
        }, 100);
    }

    function sendMessage(message) {
        // button.innerText = ':0';
        // append('human', message);
        paused = true;
        socket.emit('send_message', message);
    };

    function inputEvent(e) {
        if (e.type === 'keydown' && e.keyCode !== 13) return;
        if (paused) return;
        if (!ta.value || !ta.value.length || /^\s+$/.test(ta.value)) return;
        let message = ta.value
            .replace(/\s+/g, " ")
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .trim();
        sendMessage(message);
        setTimeout(() => {
            ta.value = '';
            ta.style.height = '30px';
        }, 10);
    };

    // event_listeners
    // button.addEventListener("click", inputEvent);
    document.addEventListener('keydown', inputEvent);

    // socket
    // TODO: the socket will need to be changed when it is running of heroku
    var socket = io.connect("http://localhost:8080");

    socket.on('hi_there', data => {
        const { message } = data;
        // append('ai', message);
        paused = false;
    });

    socket.on('response', data => {
        const { message } = data;
        responseReceived(message);
        paused = false;
    })

    socket.emit('hello');

    function rando(max, min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    checkArr = [[5, 2], [3, 3], [2, 2], [1, 4]];
    count = 2;

    function drawCheckeredBackground(can, nRow, nCol) {
        setTimeout(() => {
            console.log('draw');
            setTimeout(() => {
                ctx.clearRect(0, 0, 50, 50);
            }, 100);
            var w = can.width;
            var h = can.height;

            nRow = nRow || 10;    // default number of rows
            nCol = nCol || 10;    // default number of columns

            w /= nCol;            // width of a block
            h /= nRow;            // height of a block

            for (var i = 0; i < nRow; ++i) {
                for (var j = 0, col = nCol / 2; j < col; ++j) {
                    ctx.rect(count * j * w + (i % count ? 0 : w), i * h, w, h);
                    // ctx.rect(rando(3, 1) * j * w + (i % rando(3, 1) ? 0 : w), i * h, w, h);
                    // ctx.rect(checkArr[count][0] * j * w + (i % checkArr[count][1] ? 0 : w), i * h, w, h);
                }
            }
            ctx.fillStyle = "white";
            ctx.fill();
            count = count === 2 ? 3 : 2;

            requestAnimationFrame(() => {drawCheckeredBackground(canvas)});
        }, 500)
    }

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    // var int = setInterval(() => {drawCheckeredBackground(canvas)}, 200);
    // drawCheckeredBackground(canvas);
    window.requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(f){return setTimeout(f, 1000/60)}

    requestAnimationFrame(() => {drawCheckeredBackground(canvas)});
    // drawCheckeredBackground(canvas);

})();
