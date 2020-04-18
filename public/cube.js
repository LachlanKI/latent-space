var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 30, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer( { alpha: true } );
renderer.setPixelRatio(window.devicePixelRatio);
let boxWrap = document.getElementById('boxWrap');

boxWrap.appendChild( renderer.domElement );
renderer.setSize( boxWrap.clientWidth, boxWrap.clientHeight );

var textureLoader = new THREE.TextureLoader();

var texture = textureLoader.load( './assets/square.png' );

var materials = [
    new THREE.MeshBasicMaterial( { map: texture, transparent: true, opacity: 1, side: THREE.DoubleSide } ),
    new THREE.MeshBasicMaterial( { map: texture, transparent: true, opacity: 1, side: THREE.DoubleSide } ),
    new THREE.MeshBasicMaterial( { map: texture, transparent: true, opacity: 1, side: THREE.DoubleSide } ),
    new THREE.MeshBasicMaterial( { map: texture, transparent: true, opacity: 1, side: THREE.DoubleSide } ),
    new THREE.MeshBasicMaterial( { map: texture, transparent: true, opacity: 1, side: THREE.DoubleSide } ),
    new THREE.MeshBasicMaterial( { map: texture, transparent: true, opacity: 1, side: THREE.DoubleSide } )
];

var geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
var cube = new THREE.Mesh(geometry, materials);
scene.add( cube );

cube.rotation.y += 3;
camera.position.z = 5;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let left = false;
let up = false;

var animate = function () {
    requestAnimationFrame( animate );

    // cube.rotation.x += 0.01;
    
    cube.rotation.y = left ? cube.rotation.y - 0.0014238 : cube.rotation.y + 0.002212;
    cube.rotation.x = up ? cube.rotation.x - 0.0009232 : cube.rotation.x + 0.0012133;

    if (!left) {
        if (cube.rotation.y > 3.7) {
            left = true
        }
    } else {
         if (cube.rotation.y < 2.3) {
            left = false
        }
    }

    if (!up) {
        if (cube.rotation.x > 0.3) {
            up = true
        }
    } else {
         if (cube.rotation.x < -0.3) {
            up = false
        }
    }

    renderer.render( scene, camera );
};

animate();
