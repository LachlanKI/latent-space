(() => {

    // vars
    let paused = true;
    let input = document.getElementsByTagName("input")[0];
    let button = document.getElementsByTagName("button")[0];
    let ul = document.getElementsByTagName('ul')[0];

    // functions
    function append(who, message) {
        let li = document.createElement('li');
        li.setAttribute('class', who);
        li.appendChild(document.createTextNode(message));
        ul.append(li);
    };

    function sendMessage(message) {
        button.innerText = ':0';
        append('human', message);
        paused = true;
        socket.emit('send_message', message);
    };

    function inputEvent(e) {
        if (e.type === 'keydown' && e.keyCode !== 13) return;
        if (paused) return;
        if (!input.value || !input.value.length || /^\s+$/.test(input.value)) return;
        let message = input.value
            .replace(/\s+/g, " ")
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .trim();
        sendMessage(message);
        input.value = '';
    };

    // event_listeners
    button.addEventListener("click", inputEvent);
    document.addEventListener('keydown', inputEvent);

    // socket
    // TODO: the socket will need to be changed when it is running of heroku
    var socket = io.connect("http://localhost:8080");

    socket.on('hi_there', data => {
        const { message } = data;
        append('ai', message);
        paused = false;
    });

    socket.on('response', data => {
        button.innerText = ':)';
        const { message } = data;
        append('ai', message);
        paused = false;
    })

    socket.emit('hello');

})();
