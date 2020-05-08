(() => {

    let runway = document.getElementById('runway');
    let background = document.getElementById('background');
    let imgs = [];
    let imgsCount = 0;
    let gifInt;


    function rando(max, min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    function gif(num) {
        console.log(1337);
        // runway.src = `/assets/runway${whichGif}.gif`;
        // background.style.background = `url(/assets/gifimgs/${num}/rw(${num})${imgsCount + 1}.jpeg) no-repeat center center fixed`;
        // background.style.background = `url(/assets/gifimgs/${num}/runway${imgsCount}.jpeg) no-repeat center center fixed`;
        // background.style.background = `url(${imgs[imgsCount].src}) no-repeat center center fixed`;
        background.style.backgroundSize = `cover`;
        imgsCount++;
        if (imgsCount === 299) {
            imgsCount = 0
        };
    };

    function preload(num){
        console.log(num);
        for (var i = 1; i < 300; i++) {
            var img = new Image();
            img.src = `/assets/gifimgs/${num}/runway${i}.jpeg`;
            imgs.push(img);
            if (i === 299) {
                console.log('LOADED');
                gifInt = setInterval(() => gif(num), 42);
            };
        };
    };

    preload(1);
    // preload(rando(2, 1));

})();
