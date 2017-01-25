var scene;
var renderer;

var spaceship;
var mtlLoader;

var camera;
var camera2;
var activeCamera;
var mapCamera;
var texture;
var tunnel;

var light;
var directionalLight;
var directionalLight2;
var invLight1;
var invLight2;

var crosshair;

var freeze;
var thisLoop;
var lastLoop;
var frames;
var fps;
var fpsElement;

// SOUNDS
var ringAudio = document.createElement('audio');
ringAudio.src = 'sounds/score.wav';

var powerAudio = document.createElement('audio');
powerAudio.src = 'sounds/power.wav';
powerAudio.volume = 0.2;

var fireAudio = document.createElement('audio');
fireAudio.src = 'sounds/blaster.wav';
fireAudio.volume = 0.2;

var invincibleAudio = document.createElement('audio');
invincibleAudio.src = 'sounds/invincible.ogg';
invincibleAudio.volume = 0.2;

var deadAudio = document.createElement('audio');
deadAudio.src = 'sounds/dead.wav';
deadAudio.volume = 0.2;

var pauseAudio = document.createElement('audio');
pauseAudio.src = 'sounds/pause.wav';
pauseAudio.volume = 0.2;

var musicplayer = document.createElement("audio");
musicplayer.src = "sounds/love.mp3";
musicplayer.volume = 0.2;

var musicPause;
var prevMusicState;

var ringMaterial = new THREE.MeshPhongMaterial({color: 0xFFDF00});
var ringGeometry = new THREE.RingGeometry(4, 6, 32);

var spikeMaterial = new THREE.MeshPhongMaterial({color: 0xFF0000});
var spikeGeometry = new THREE.BoxGeometry(12, 12, 12);

var astMaterial = new THREE.MeshPhongMaterial({color: 0x00FF00});
var astGeometry = new THREE.BoxGeometry(12, 12, 12);

var powerMaterial = new THREE.MeshBasicMaterial({color: 0x009fff});
var powerGeometry = new THREE.OctahedronGeometry(6, 0);

var rings = [];
var spikes = [];
var asteroids =[];
var powers = [];

var PosY = [-25,-10,5];
var PosX = [-15,0,15];

var bulletMaterial;
var bulletGeometry;
var bullets = [];

var numRings;
var numSpikes;
var numPowers;

var raycaster;
var mouse;

// initialize score and game features;
var score;
var lastScore;
var bestScore;
var invincible;

var startTime;

var keyboard;
var left;
var right;
var up;
var down;
var zoomIn;
var zoomOut;

var velocity;

function loadAssets(){
      // SETUP RENDERER & SCENE
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize( window.innerWidth, window.innerHeight );

  var onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
  }

  var onError = function ( xhr ) { };

   //setup model
  spaceship = new THREE.Object3D();
  mtlLoader = new THREE.MTLLoader();

  mtlLoader.load( 'models/fighter.mtl', function( materials ) {
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials( materials );
    objLoader.load( 'models/fighter.obj', function ( object ) {
      spaceship = object;
      spaceship.scale.set(0.5,0.5,0.5);
      spaceship.position.set(0,-10,0);
      spaceship.rotation.y = Math.PI;
      scene.add(spaceship);
    }, onProgress, onError);
  });

  THREE.DefaultLoadingManager.onProgress = function ( item, loaded, total ) {
    console.log( item, loaded, total );
};

  texture = new THREE.ImageUtils.loadTexture('images/space.jpg');
  texture.wrapT = THREE.RepeatWrapping;

  init();
}

//initialize game environment
function init(){
  musicPause = false;
  freeze = true;
  score = 0;
  lastScore = 0;
  bestScore = 0;
  invincible = false;

  rings = [];
  spikes = [];
  powers = [];

  numRings = 8;
  numSpikes = 20;
  numAsts = 5;
  numPowers = 1;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // initialize score and game features;
  score = 0;
  lastScore = 0;
  bestScore = 0;
  invincible = false;

  //renderer.setClearColor(0xFFFFFF);
  document.getElementById("WebGLCanvas").appendChild(renderer.domElement); 

  // SETUP CAMERAS
  camera = new THREE.PerspectiveCamera(70,screen.width/screen.height,1,1000); // view angle, aspect ratio, near, far
  camera.position.set(0, 0, 50);
  camera.lookAt(scene.position);
  scene.add(camera);

  camera2 = new THREE.PerspectiveCamera(70,screen.width/screen.height,1,1000); // view angle, aspect ratio, near, far
  camera2.position.set(0, -5, 50);
  camera2.lookAt(scene.position);
  scene.add(camera2);

  activeCamera = 1;

  // orthographic cameras
  mapCamera = new THREE.OrthographicCamera(
    100 / -2,   // Left
    100 / 2,    // Right
    100 / 2,   // Top
    100 / -2,  // Bottom
    0,                  // Near 
    700);                // Far 
  mapCamera.lookAt( new THREE.Vector3(0,0,-1));
  mapCamera.position.set(0, 0, 60);
  scene.add(mapCamera);

  tunnel = new THREE.Mesh(
    new THREE.CylinderGeometry(50, 50, 500, 16, 16, true),
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide}));
  tunnel.rotation.x = -Math.PI/2
  scene.add(tunnel);

  // AMBIENT LIGHT
  var light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );

  // DIRECTIONAL LIGHT
  directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
  directionalLight.position.set( 0, 0, -10000 );
  scene.add( directionalLight );

  directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.set( 0, 0, 10000 );
  scene.add( directionalLight2 );

  // RANDOMLY generate the 3 types of objects at positions in space
  for ( var i = 0; i < numRings; i++ ) {
    var mesh = new THREE.Mesh( ringGeometry, ringMaterial );
    mesh.position.set(PosX[Math.floor(Math.random()*PosX.length)],
                      PosY[Math.floor(Math.random()*PosY.length)],
                      -3000 + Math.random()*-10000);
    scene.add( mesh );
    rings.push( mesh );
  }

  for ( var i = 0; i < numSpikes; i++ ) {
    var mesh = new THREE.Mesh( spikeGeometry, spikeMaterial.clone() );
    mesh.position.set(PosX[Math.floor(Math.random()*PosX.length)],
                      PosY[Math.floor(Math.random()*PosY.length)],
                      -3000 + Math.random()*-10000);
    mesh.material.transparent = true;
    mesh.material.opacity = 0.6;
    scene.add( mesh );
    spikes.push( mesh );
  }

  for ( var i = 0; i < numAsts; i++ ) {
    var mesh = new THREE.Mesh( astGeometry, astMaterial.clone() );
    mesh.position.set(PosX[Math.floor(Math.random()*PosX.length)],
                      PosY[Math.floor(Math.random()*PosY.length)],
                      -3000 + Math.random()*-10000);
    mesh.material.transparent = true;
    mesh.material.opacity = 0.6;
    scene.add( mesh );
    asteroids.push( mesh );
  }

  for ( var i = 0; i < numPowers; i++ ) {
    var mesh = new THREE.Mesh( powerGeometry, powerMaterial.clone() );
    mesh.position.set(PosX[Math.floor(Math.random()*PosX.length)],
                      PosY[Math.floor(Math.random()*PosY.length)],
                      -20000 + Math.random()*-1000);
    mesh.material.transparent = true;
    mesh.material.opacity = 0.6;
    scene.add( mesh );
    powers.push( mesh );
  }

  keyboard = new THREEx.KeyboardState();
  left = false;
  right = false;
  up = false;
  down = false;
  zoomIn = false;
  zoomOut = false;

  velocity = new THREE.Vector2();
  startTime = performance.now();

  thisLoop = new Date;
  lastLoop = new Date;
  frames = 0;

  fpsElement = document.getElementById("fps");
}

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
 }

 // ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

// EVENT LISTENER RESIZE
window.addEventListener('resize',resize);

// SETUP Keyboard

var onKeyDown = function ( event ) {
  switch ( event.keyCode ) {
    case 87: // w
    up = true;
    break;
    case 65: // a
    left = true; 
    break;
    case 83: // s
    down = true;
    break;
    case 68: // d
    right = true;
    break;
    case 78:  // n
    zoomIn = true;
    break;
    case 77:  //m
    zoomOut = true;
    break;
    case 80:  //p
    musicPause = !musicPause;
    break;
    case 13:  // enter (pause)
    musicplayer.pause();
    pauseAudio.pause();
    pauseAudio.currentTime = 0;
    pauseAudio.play();
    if(freeze){
      freeze = false;
      document.getElementById('startmenu').style.display = "none";
    } else if(!freeze){
      freeze = true;
      document.getElementById('startmenu').style.display = "block";
    }
    break;

    case 66:
    if (activeCamera == 1){
      activeCamera = 2;
    }
    else if (activeCamera == 2){
      activeCamera = 1;
    }
    break;
  }
};
var onKeyUp = function ( event ) {
  switch ( event.keyCode ) {
    case 87: // w
    up = false;
    break;
    case 65: // a
    left = false; 
    break;
    case 83: // s
    down = false;
    break;
    case 68: // d
    right = false;
    break;
    case 78:  // n
    zoomIn = false;
    break;
    case 77:
    zoomOut = false;
    break;
  }
};
document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );

var curObject;
var prevObject;

function onMouseMove( event){
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  // reposition cursor at mouse position
  crosshair = document.getElementById("crosshair");
  crosshair.style.top = event.clientY - crosshair.clientHeight / 2;
  crosshair.style.left = event.clientX - crosshair.clientWidth / 4;

  if (activeCamera == 1){
    raycaster.setFromCamera( mouse, camera );
  }
  else if(activeCamera == 2){
    raycaster.setFromCamera( mouse, camera2 );
  }

  var spikeIntersects = raycaster.intersectObjects( spikes );
  if (spikeIntersects.length > 0){
    prevObject = curObject;
    curObject = spikeIntersects[0].object;
    curObject.material.color.setHex(0x00BFFF);
    if (curObject !== prevObject && typeof prevObject != "undefined"){
      prevObject.material.color.setHex(0xFF0000);
    }
  }
  else if (typeof curObject != "undefined"){
    curObject.material.color.setHex(0xFF0000);
  }
}

document.addEventListener( 'mousemove', onMouseMove, false );

// Setup Mouse raycasting
function onMouseDown( event ) {
  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  if (activeCamera == 1){
    raycaster.setFromCamera( mouse, camera );
  }
  else if(activeCamera == 2){
    raycaster.setFromCamera( mouse, camera2 );
  }

  var spikeIntersects = raycaster.intersectObjects( spikes );
  var astIntersects = raycaster.intersectObjects( asteroids );

    if (spikeIntersects.length > 0 && !freeze){
      fireAudio.pause();
      fireAudio.currentTime = 0;
      fireAudio.play();
      xDis = PosX[Math.floor(Math.random()*PosX.length)];
      yDis = PosY[Math.floor(Math.random()*PosY.length)];
      zDis = -3000 + Math.random()*-10000;
      spikeIntersects[0].object.position.set(xDis,
                                 yDis,
                                 zDis);
      spikeIntersects[0].object.material.color.setHex(0xFF0000);
        if (score >= 1 && !invincible){
          score--;
        }
        else if(invincible){
          score++;
        }
      }

    if (astIntersects.length > 0 && !freeze){
      fireAudio.pause();
      fireAudio.currentTime = 0;
      fireAudio.play();
      xDis = PosX[Math.floor(Math.random()*PosX.length)];
      yDis = PosY[Math.floor(Math.random()*PosY.length)];
      zDis = -3000 + Math.random()*-10000;
      astIntersects[0].object.position.set(xDis,
                                 yDis,
                                 zDis);
      astIntersects[0].object.material.color.setHex(0x00FF00);
      score++;
  }
}

document.addEventListener( 'mousedown', onMouseDown, false );

//ring collision using boundary box(sphere)
function ringCollision(){
  for ( var i = 0; i < rings.length; i++ ){
    if (spaceship.position.distanceTo(rings[i].position) < 12) {
         xDis = PosX[Math.floor(Math.random()*PosX.length)];
         yDis = PosY[Math.floor(Math.random()*PosY.length)];
         zDis = -3000 + Math.random()*-1000;
         rings[i].position.set(xDis,
                                 yDis,
                                 zDis);
        ringAudio.pause();
        ringAudio.currentTime = 0;
        ringAudio.play();
        score++;
      }
    }
}

//spike(red cube) collision 
function spikeCollision(){
  for ( var i = 0; i < spikes.length; i++ ){
    if (spaceship.position.distanceTo(spikes[i].position) < 12) {
        if (!invincible) {
          musicplayer.pause();
          deadAudio.pause();
          deadAudio.currentTime = 0;
          deadAudio.play();
          lastScore = score;
          window.alert("\t You Lost!\t\n"+"\tYour Score: " + score + "\t" +"\n\tPlay Again?\t");
          location.reload();
          if (score > bestScore){
            bestScore = score;
            score = 0;
          }
        }
      }
    }
}

//powerup diamond collision
function powerCollision(){
  for ( var i = 0; i < powers.length; i++ ){
    if (spaceship.position.distanceTo(powers[i].position) < 12) {
         xDis = PosX[Math.floor(Math.random()*PosX.length)];
         yDis = PosY[Math.floor(Math.random()*PosY.length)];
         zDis = -100000 + Math.random()*-1000;
         powers[i].position.set(xDis,
                                 yDis,
                                 zDis);

        colorAllSpikes(0x00FF00);

        invLight1 = new THREE.DirectionalLight( 0x33A1DE, 10 );
        invLight2 = new THREE.DirectionalLight( 0x33A1DE, 10 );

        invLight1.position.set( 0, 5, 0 );
        invLight2.position.set( 0, -5, 0 );
        scene.add( invLight1 );
        scene.add( invLight2 );

        prevMusicState = musicPause;
        musicPause = true;

        powerAudio.pause();
        powerAudio.currentTime = 0;
        powerAudio.play();

        invincibleAudio.pause();
        invincibleAudio.currentTime = 0;
        invincibleAudio.play();

        invincible = true;
        startTime = new Date().getTime() / 1000;
      }
    }
}

//update ship elements and positions at each frame
function updateShip() {
  var time = new Date().getTime() / 1000;

  //GLOW the object when invincibility mode is on
  if (invincible){
    colorAllSpikes(0x00FF00);
    //make object start flashing when invincibility time is under 5 seconds
    if (time - startTime >= 15 && time - startTime < 20){
      scene.remove(invLight1);
      scene.remove(invLight2);
      var flashTime = Math.round(new Date().getTime() / 100)
      //flash the light faster when time is under 2 seconds
      if (time - startTime >= 18){
        var flashTime = Math.round(new Date().getTime() / 50)
      }
      invLight1 = new THREE.DirectionalLight( 0x33A1DE, (flashTime & 2) * 10);
      invLight2 = new THREE.DirectionalLight( 0x33A1DE, (flashTime & 2) * 10);

      invLight1.position.set( 0, 5, 0 );
      invLight2.position.set( 0, -5, 0);

      scene.add( invLight1 );
      scene.add( invLight2 );
    }
    else if (time - startTime >= 20){
      if(!musicPause){
        musicplayer.play();
      }
      colorAllSpikes(0xFF0000);
      invincibleAudio.pause();
      invincible = false;
      musicPause = prevMusicState;
      scene.remove(invLight1);
      scene.remove(invLight2);
    }
  }

  var delta = 1;

  //move the spaceship according to keystate
  if (left && spaceship.position.x > -15){
    spaceship.translateX(delta);
  }

  if (right && spaceship.position.x < 15){
    spaceship.translateX(-delta);
  }

  if (up && spaceship.position.y < 5){
    spaceship.translateY(delta);
  }

  if (down && spaceship.position.y > -25){
    spaceship.translateY(-delta);
  }

  if (!left && spaceship.position.x < 0){
    spaceship.translateX(-delta);
  }

  if (!right && spaceship.position.x > 0){
    spaceship.translateX(delta);
  }

  if (!up && spaceship.position.y > -10){
    spaceship.translateY(-delta);
  }

  if (!down && spaceship.position.y < -10){
    spaceship.translateY(delta);
  }

  // zoom in toggle, make sure the camera does not zoom in too close
  if (zoomIn){
    if (activeCamera == 1 && camera.position.z > 35){ 
    camera.translateZ(-delta);
    }
    else if (activeCamera == 2 && camera2.position.z > 35){
    camera2.translateZ(-delta);
    }
  }

  // zoom out toggle make sure camera does not zoom out too far
  if (zoomOut){
    if (activeCamera == 1 && camera.position.z < 60){ 
    camera.translateZ(delta);
    }
    else if (activeCamera == 2 && camera2.position.z < 60){
    camera2.translateZ(delta);
    }
  }
}

//update the Rings at each frame
function updateRings(){
	for ( var i = 0; i < rings.length; i++ ){
		if ( rings[i].position.z > 100 ) { // if the object has move behind the ship/out the frame
         xDis = PosX[Math.floor(Math.random()*PosX.length)];
         yDis = PosY[Math.floor(Math.random()*PosY.length)];
         zDis = -3000 + Math.random()*-10000;
			   rings[i].position.set(xDis,
					  				           yDis,
					  				           zDis);
		} else {
			rings[i].position.z += 10;
		}
	}
}

//update spikes(red cube) at each frame and check if out of play
function updateSpikes(){
  for ( var i = 0; i < spikes.length; i++ ){
    if ( spikes[i].position.z > 100 ) {
         xDis = PosX[Math.floor(Math.random()*PosX.length)];
         yDis = PosY[Math.floor(Math.random()*PosY.length)];
         zDis = -3000 + Math.random()*-10000;
         spikes[i].position.set(xDis,
                                yDis,
                                zDis);
         spikes[i].material.color.setHex(0xFF0000);
    } else {
      spikes[i].position.z += 10;
    }
  }
}

function updateAsteroids(){
  for ( var i = 0; i < asteroids.length; i++ ){
    if ( asteroids[i].position.z > 100 ) {
         xDis = PosX[Math.floor(Math.random()*PosX.length)];
         yDis = PosY[Math.floor(Math.random()*PosY.length)];
         zDis = -3000 + Math.random()*-10000;
         asteroids[i].position.set(xDis,
                                   yDis,
                                   zDis);
    } else {
      asteroids[i].position.z += 10;
    }
  }
}

function updatePowers(){
  for ( var i = 0; i < powers.length; i++ ){
    if ( powers[i].position.z > 100 ) {
         xDis = PosX[Math.floor(Math.random()*PosX.length)];
         yDis = PosY[Math.floor(Math.random()*PosY.length)];
         zDis = -50000 + Math.random()*-1000;
         powers[i].position.set(xDis,
                                yDis,
                                zDis);
    } else {
      powers[i].position.z += 10;
    }
  }
}

function loopMusic(){
  if (!musicPause && !invincible){
    musicplayer.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
    musicplayer.play();
  } else {
    musicplayer.pause();
  }
}

function colorAllSpikes(color){
  for ( var i = 0; i < spikes.length; i++ ){
    spikes[i].material.color.setHex(color);
  }
}

function update() {
  thisLoop = new Date;
  frames++;
  if( thisLoop - lastLoop > 1000){
    fps = Math.floor((1000*frames/(thisLoop - lastLoop)));
    fpsElement.innerHTML = "";
    fpsElement.innerHTML = fps;
    lastLoop = thisLoop;
    frames = 0;
  }
    if (!freeze){
      resize();
      //offset the texture at each frame
      texture.offset.y += 0.005;
      updateShip();
      ringCollision();
      spikeCollision();
      powerCollision();
      updateRings();
      updateSpikes();
      updateAsteroids();
      updatePowers();
      loopMusic();
    }

    document.getElementById("overlaytext").innerHTML = "";
    document.getElementById("overlaytext").innerHTML = "Score: " + score;

    var w = window.innerWidth, h = window.innerHeight;
    renderer.autoClear = false;

    renderer.clear();
    renderer.setViewport( 0, 0, w, h );

    if(activeCamera == 1){
      renderer.render(scene,camera);
    }
    else if(activeCamera == 2){
      renderer.render(scene,camera2);
    }

    renderer.clearDepth();
    renderer.setViewport( 1, 1, w/5, w/5 );
    renderer.render(scene, mapCamera );

    requestAnimationFrame(update);
}

loadAssets();
update();
