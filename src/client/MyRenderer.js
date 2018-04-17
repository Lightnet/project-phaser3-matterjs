/*
    Information: This class handle visible part to draw or render game object. Renderer handle Phaser 3.x.x setup Draw, Matter.js 2D physics Draw Render, and lancegg objects sync.
*/

'use strict';

import isNode from 'detect-node'
if (!isNode) {                                                                                                                                                                                        
    //require('phaser');
    //require('phaser/dist/phaser');
    require('phaser/dist/phaser.min');
    //require('phaser/dist/phaser-arcade-physics');
}
//import 'phaser';
import Utils from './../common/Utils';
import Renderer from './PhaserRenderer';
import Ship from '../common/Ship';

export default class MyRenderer extends Renderer {

    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        this.sprites = {}; // server and client id objects
        //Phaser config game 
        //this.config = {};
        this.scene = null;
        this.camera = {x:0,y:0}; //place holder
        this.bgPhaseX = 0;
        this.bgPhaseY = 0;

        this.config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent	: 'phaser-app',//Id of the containing DOM-Element.
            //physics: {
                //default: 'arcade',
                //arcade: {
                    //gravity: { y: 200 }
                //}
            //},
            scene: {
                key:"default",//scene name
                preload: this.preload,
                create: this.create
            }
        };
    }

    init() {
        if (this.initPromise) return this.initPromise;
        this.isReady = false;
        this.lookingAt = { x: 0, y: 0 };
        this.elapsedTime = Date.now();
        this.viewportWidth = 800;
        this.viewportHeight = 600;

        this.shippos = document.getElementById("shippos");
        this.shipvec = document.getElementById("shipvec");
        this.shipangle = document.getElementById("shipangle");

        this.pshippos = document.getElementById("pshippos");
        this.pshipvec = document.getElementById("pshipvec");
        this.pshipangle = document.getElementById("pshipangle");

        //Trigger when the phaser scene create is loaded and setup ui
        this.gameEngine.once('scenebootready', () => {
            //console.log("scenebootready!");
            this.setReady();
            //console.log("this.gameEngine.bphysicsdebug",this.gameEngine.bphysicsdebug);
            if(this.gameEngine.bphysicsdebug){
                this.setupMatterJSRender();
            }
            window.addEventListener('resize', ()=>{ 
                //this.setRendererSize(); 
            });
            //this.setRendererSize();
        });

        this.initPromise = new Promise((resolve, reject)=>{
            let onLoadComplete = () => {
                //this.isReady = true;
                resolve();
                //console.log("finished loading...");
            };

            //This will help load texture correctly with in initPromise 
            this.config.scene.create = function() {
                let render = MyRenderer.getInstance();
                //console.log(this);
                //setup audio
                this.soundFX_projectilehit = this.sound.add("projectilehit");
                this.soundFX_lasergun = this.sound.add("lasergun");
                //
                this.background = this.add.tileSprite(0, 0, 800, 600, 'space');
                //
                //this.shippos = this.add.text(10, 50);
                //this.shippos.setText('Pos:');

                //this.shipvec = this.add.text(10, 70);
                //this.shipvec.setText('Vec:');

                //this.shipangle = this.add.text(10, 90);
                //this.shipangle.setText('Angle:');

                //render.setupMatterJS();
                render.gameEngine.emit('scenebootready');//trigger setup and ui assign listener.
                onLoadComplete();
            }

            this.game = new Phaser.Game(this.config);
            //console.log("initPromise");
        });
        
        return this.initPromise;
    }

    setupMatterJSRender(){
        this.rendermatter = this.gameEngine.physicsEngine.Render.create({
            element: document.getElementById("matter-app"),
            engine: this.gameEngine.physicsEngine.engine,
            
            options: {
                //width: window.innerWidth,
                //height: window.innerHeight,
                width: 800,
                height: 600,
                //wireframes: false, // <-- important
                showAngleIndicator: true,
                wireframeBackground:'transparent',
                visible : false,
                enabled: false,
                hasBounds: true,
                background:'transparent'
            }
        });

        this.gameEngine.physicsEngine.Render.run(this.rendermatter);
    }

    // Resize
    setRendererSize() {
        //this.viewportWidth = window.innerWidth;
        //this.viewportHeight = window.innerHeight;
        //console.log("resize");
        var guiContainer = document.querySelector("#guiContainer");
        
        var canvas = document.querySelector("canvas");
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var windowRatio = windowWidth / windowHeight;
        var gameRatio = this.game.config.width / this.game.config.height;
        if(windowRatio < gameRatio){
            canvas.style.width = windowWidth + "px";
            canvas.style.height = (windowWidth / gameRatio) + "px";

            guiContainer.style.width = canvas.style.width;
            guiContainer.style.height = canvas.style.height;
        }
        else{
            canvas.style.width = (windowHeight * gameRatio) + "px";
            canvas.style.height = windowHeight + "px";

            guiContainer.style.width = canvas.style.width;
            guiContainer.style.height = canvas.style.height;
        }
    }

    //Phaser
    preload(){
        this.load.setBaseURL('http://localhost:3000/');

        this.load.audio("projectilehit","assets/audio/193429__unfa__projectile-hit.mp3");
        this.load.audio("lasergun","assets/audio/248293__chocobaggy__weird-laser-gun.mp3");

        this.load.image('ship', 'assets/sprites/asteroids_ship.png');
        this.load.image('shot', 'assets/shot.png');
        this.load.image('sky', 'assets/skies/space3.png');
        this.load.image('space', 'assets/skies/space4.png');
        this.load.image('logo', 'assets/sprites/phaser3-logo.png');
        this.load.image('red', 'assets/particles/red.png');
        this.load.image('smokeparticle', 'assets/smokeparticle.png');
    }

    setReady(){
        this.getCurrentCamera();
        this.isReady = true;
        this.gameEngine.emit('renderer.ready');
    }

    //Phaser
    create(){ //not used here
        //let render = MyRenderer.getInstance();
        //this.add.image(400, 300, 'sky');
        /*
        var particles = this.add.particles('red');
        var emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        });
        var logo = this.physics.add.image(400, 100, 'logo');
        logo.setVelocity(100, 200);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);
        emitter.startFollow(logo);
        */
        //console.log(this.scene.manager.keys.default);
        //console.log(this.game.scene.keys['default']);
    }
    //Phaser
    update(){
        
    }

    updateshipinfo(obj){
        //this.shippos = document.getElementById("shippos");
        //this.shipvec = document.getElementById("shipvec");
        //this.shipangle = document.getElementById("shipangle");

        this.shippos.innerHTML = "pos x:"+ obj.position.x + " y:" + obj.position.y;
        this.shipvec.innerHTML = "vec x:"+ obj.velocity.x + " y:" + obj.velocity.y;
        this.shipangle.innerHTML = "angle:"+ obj.angle;


        this.pshippos.innerHTML = "ppos x:"+ obj.physicsObj.position.x + " y:" + obj.position.y;
        this.pshipvec.innerHTML = "pvec x:"+ obj.physicsObj.velocity.x + " y:" + obj.velocity.y;
        this.pshipangle.innerHTML = "pangle:"+ obj.physicsObj.angle;

    }

    //client connection update and objects sync
    draw(t, dt) {
        super.draw(t, dt);

        let now = Date.now();

        if (!this.isReady) return; // assets might not have been loaded yet

        let worldWidth = this.gameEngine.worldSettings.width;
        let worldHeight = this.gameEngine.worldSettings.height;

        if(!this.camera) return;
        let viewportSeesRightBound = this.camera.x < this.viewportWidth - worldWidth;
        let viewportSeesLeftBound = this.camera.x > 0;
        let viewportSeesTopBound = this.camera.y > 0;
        let viewportSeesBottomBound = this.camera.y < this.viewportHeight - worldHeight;

        //objects sync
        for (let objId of Object.keys(this.sprites)) {
            let objData = this.gameEngine.world.objects[objId];
            let sprite = this.sprites[objId];

            if (objData) {

                // if the object requests a "showThrust" then invoke it in the actor
                if (sprite.actor && sprite.actor.thrustEmitter) {
                    sprite.actor.thrustEmitter.emit = !!objData.showThrust;
                    //console.log(objData.showThrust);
                }

                if(objData instanceof Ship && sprite == this.playerShip){
                    //console.log(objData.position);
                    //console.log(objData.position);
                    this.updateshipinfo(objData);

                }

                if (objData instanceof Ship && sprite != this.playerShip) {
                    this.updateOffscreenIndicator(objData);
                }

                //update sprite object from client object position
                //console.log(objData.position);
                sprite.x = objData.position.x;
                sprite.y = objData.position.y;

                if (objData instanceof Ship){
                    //sprite.actor.shipContainerSprite.rotation = this.gameEngine.world.objects[objId].angle * Math.PI/180;
                    //console.log(this.gameEngine.world.objects[objId].angle * Math.PI/180);
                    let angle = this.gameEngine.world.objects[objId].angle;
                    sprite.rotation = angle * Math.PI/180;
                    //sprite.rotation = Math.PI/180 * this.gameEngine.world.objects[objId].angle;
                    //sprite.rotation = this.gameEngine.world.objects[objId].angle;
                    //console.log(sprite.rotation);
                } else{
                    if(this.gameEngine.world.objects[objId] !=null){
                        //sprite.rotation = this.gameEngine.world.objects[objId].angle * Math.PI/180;
                        sprite.rotation = this.gameEngine.world.objects[objId].angle; //radian
                        //console.log("angle?");
                        //console.log(this.gameEngine.world.objects[objId].angle);
                    }
                }

                
                // make the wraparound seamless for objects other than the player ship
                if (sprite != this.playerShip && viewportSeesLeftBound && objData.position.x > this.viewportWidth - this.camera.x) {
                    sprite.x = objData.position.x - worldWidth;
                }
                if (sprite != this.playerShip && viewportSeesRightBound && objData.position.x < -this.camera.x) {
                    sprite.x = objData.position.x + worldWidth;
                }
                if (sprite != this.playerShip && viewportSeesTopBound && objData.position.y > this.viewportHeight - this.camera.y) {
                    sprite.y = objData.position.y - worldHeight;
                }
                if (sprite != this.playerShip && viewportSeesBottomBound && objData.position.y < -this.camera.y) {
                    sprite.y = objData.position.y + worldHeight;
                }
                
            }

            if (sprite) {
                // object is either a Phaser sprite or an Actor. Actors have renderSteps
                if (sprite.actor && sprite.actor.renderStep) {
                    sprite.actor.renderStep(now - this.elapsedTime);
                }
            }
        }

        
        let cameraTarget;
        if (this.playerShip) {
            cameraTarget = this.playerShip;
            // this.cameraRoam = false;

            if (this.scene){
                if(this.playerShip.actor){
                    //console.log(this.playerShip.actor);
                    //this.scene.shippos.setText("pos x:"+this.playerShip.actor.position.x + " y:" + this.playerShip.actor.position.y);


                }
            }
        } else if (!this.gameStarted && !cameraTarget) {

            // calculate centroid
            cameraTarget = getCentroid(this.gameEngine.world.objects);
            this.cameraRoam = true;
        }

        if (cameraTarget) {
            // 'cameraroam' in Utils.getUrlVars()
            if (this.cameraRoam) {
                let lookingAtDeltaX = cameraTarget.x - this.lookingAt.x;
                let lookingAtDeltaY = cameraTarget.y - this.lookingAt.y;
                let cameraTempTargetX;
                let cameraTempTargetY;

                if (lookingAtDeltaX > worldWidth / 2) {
                    this.bgPhaseX++;
                    cameraTempTargetX = this.lookingAt.x + worldWidth;
                } else if (lookingAtDeltaX < -worldWidth / 2) {
                    this.bgPhaseX--;
                    cameraTempTargetX = this.lookingAt.x - worldWidth;
                } else {
                    cameraTempTargetX = this.lookingAt.x + lookingAtDeltaX * 0.02;
                }

                if (lookingAtDeltaY > worldHeight / 2) {
                    cameraTempTargetY = this.lookingAt.y + worldHeight;
                    this.bgPhaseY++;
                } else if (lookingAtDeltaY < -worldHeight / 2) {
                    this.bgPhaseY--;
                    cameraTempTargetY = this.lookingAt.y - worldHeight;
                } else {
                    cameraTempTargetY = this.lookingAt.y + lookingAtDeltaY * 0.02;
                }

                this.centerCamera(cameraTempTargetX, cameraTempTargetY);

            } else {
                this.centerCamera(cameraTarget.x, cameraTarget.y);
            }
        }

        let bgOffsetX = this.bgPhaseX * worldWidth + this.camera.x;
        let bgOffsetY = this.bgPhaseY * worldHeight + this.camera.y;

        if (this.scene == null){
            this.scene = this.getScene();
        }
        
        if (this.scene){
            //https://labs.phaser.io/edit.html?src=src\camera\scroll%20view.js
            //https://labs.phaser.io/edit.html?src=src\camera\follow%20sprite.js

            //camera scroll viewport but not camera position
            this.scene.cameras.main.scrollX = this.camera.x * -1;
            this.scene.cameras.main.scrollY = this.camera.y * -1;

            //tilemap move scroll but not position
            this.scene.background.tilePositionX = bgOffsetX * -1; //var from create function scene
            this.scene.background.tilePositionY = bgOffsetY * -1; //var from create function scene

            if (cameraTarget){
                //set tilesprite position while following player
                this.scene.background.setX(this.scene.cameras.main.scrollX  + this.viewportWidth/2 );
                this.scene.background.setY(this.scene.cameras.main.scrollY  + this.viewportHeight/2);
            }
        }

        if(this.gameEngine.bphysicsdebug){
            // https://github.com/liabru/matter-js/blob/master/examples/views.js#L96-L126
            // option{ hasBounds: true }
            this.rendermatter.bounds.min.x = this.scene.cameras.main.scrollX;
            this.rendermatter.bounds.max.x = this.scene.cameras.main.scrollX + this.viewportWidth;

            this.rendermatter.bounds.min.y = this.scene.cameras.main.scrollY;
            this.rendermatter.bounds.max.y = this.scene.cameras.main.scrollY + this.viewportHeight;
        }
        //Bounds.translate(this.render.bounds, translate);


        this.elapsedTime = now;
    }

    addObject(obj) {
        super.addObject(obj);
        //console.log("renderer add object");
        //console.log(obj);
    }

    removeObject(obj) {
        super.removeObject(obj);
        //console.log(this.sprites);
        //console.log(obj);
        //console.log("renderer remove object");
        //this.sprites[obj.id].destroy();
        //delete this.sprites[obj.id];
    }

    //this handle for current player to setup control, viewport, and ui
    addPlayerShip(sprite) {
        this.playerShip = sprite;
        
        document.body.classList.remove('lostGame');
        if (!document.body.classList.contains('tutorialDone')){
            document.body.classList.add('tutorial');
        }
        document.body.classList.remove('lostGame');
        document.body.classList.add('gameActive');
        //document.querySelector('#tryAgain').disabled = true;
        //document.querySelector('#joinGame').disabled = true;
        //document.getElementById("joinGame").disabled= true;
        //document.querySelector('#joinGame').style.opacity = 0;

        document.querySelector('#joinGame').style.display = 'none';
        
        this.gameStarted = true; // todo state shouldn't be saved in the renderer
    }

    /**
     * Centers the viewport on a coordinate in the gameworld
     * @param {Number} targetX
     * @param {Number} targetY
     */
    centerCamera(targetX, targetY) {
        if (isNaN(targetX) || isNaN(targetY)) return;
        if (!this.lastCameraPosition){
            this.lastCameraPosition = {};
        }

        this.lastCameraPosition.x = this.camera.x;
        this.lastCameraPosition.y = this.camera.y;

        this.camera.x = this.viewportWidth / 2 - targetX;
        this.camera.y = this.viewportHeight / 2 - targetY;
        //this.cameras.main.setSize(400, 300);// from game with scene class
        //this.cameras.startFollow(clown);

        this.lookingAt.x = targetX;
        this.lookingAt.y = targetY;
    }

    addOffscreenIndicator(objData) {
        let container = document.querySelector('#offscreenIndicatorContainer');
        let indicatorEl = document.createElement('div');
        indicatorEl.setAttribute('id', 'offscreenIndicator' + objData.id);
        indicatorEl.classList.add('offscreenIndicator');
        container.appendChild(indicatorEl);
    }

    updateOffscreenIndicator(objData){
        // player ship might have been destroyed
        if (!this.playerShip) return;

        let indicatorEl = document.querySelector('#offscreenIndicator' + objData.id);
        if (!indicatorEl) {
            console.error(`No indicatorEl found with id ${objData.id}`);
            return;
        }
        let playerShipObj = this.gameEngine.world.objects[this.playerShip.id];
        let slope = (objData.position.y - playerShipObj.position.y) / (objData.position.x - playerShipObj.position.x);
        let b = this.viewportHeight/ 2;

        let padding = 30;
        let indicatorPos = { x: 0, y: 0 };

        if (objData.position.y < playerShipObj.position.y - this.viewportHeight/2) {
            indicatorPos.x = this.viewportWidth/2 + (padding - b)/slope;
            indicatorPos.y = padding;
        } else if (objData.position.y > playerShipObj.position.y + this.viewportHeight/2) {
            indicatorPos.x = this.viewportWidth/2 + (this.viewportHeight - padding - b)/slope;
            indicatorPos.y = this.viewportHeight - padding;
        }

        if (objData.position.x < playerShipObj.position.x - this.viewportWidth/2) {
            indicatorPos.x = padding;
            indicatorPos.y = slope * (-this.viewportWidth/2 + padding) + b;
        } else if (objData.position.x > playerShipObj.position.x + this.viewportWidth/2) {
            indicatorPos.x = this.viewportWidth - padding;
            indicatorPos.y = slope * (this.viewportWidth/2 - padding) + b;
        }

        if (indicatorPos.x == 0 && indicatorPos.y == 0){
            indicatorEl.style.opacity = 0;
        } else {
            indicatorEl.style.opacity = 1;
            let rotation = Math.atan2(objData.position.y - playerShipObj.position.y, objData.position.x - playerShipObj.position.x);
            rotation = rotation * 180/Math.PI; // rad2deg
            indicatorEl.style.transform = `translateX(${indicatorPos.x}px) translateY(${indicatorPos.y}px) rotate(${rotation}deg) `;
        }
    }

    removeOffscreenIndicator(objData) {
        let indicatorEl = document.querySelector('#offscreenIndicator'+objData.id);
        if (indicatorEl && indicatorEl.parentNode)
            indicatorEl.parentNode.removeChild(indicatorEl);
    }

    updateHUD(data){
        if (data.RTT){ qs('.latencyData').innerHTML = data.RTT;}
        if (data.RTTAverage){ qs('.averageLatencyData').innerHTML = truncateDecimals(data.RTTAverage, 2);}
    }

    updateScore(data){
        
        let scoreContainer = qs('.score');
        let scoreArray = [];

        // remove score lines with objects that don't exist anymore
        let scoreEls = scoreContainer.querySelectorAll('.line');
        for (let x=0; x < scoreEls.length; x++){
            if (data[scoreEls[x].dataset.objId] == null){
                scoreEls[x].parentNode.removeChild(scoreEls[x]);
            }
        }

        for (let id of Object.keys(data)){
            let scoreEl = scoreContainer.querySelector(`[data-obj-id='${id}']`);
            // create score line if it doesn't exist
            if (scoreEl == null){
                scoreEl = document.createElement('div');
                scoreEl.classList.add('line');
                if (this.playerShip && this.playerShip.id == parseInt(id)) scoreEl.classList.add('you');
                scoreEl.dataset.objId = id;
                scoreContainer.appendChild(scoreEl);
            }

            // stupid string/number conversion
            if (this.sprites[parseInt(id)])
                this.sprites[parseInt(id)].actor.changeName(data[id].name);

            scoreEl.innerHTML = `${data[id].name}: ${data[id].kills}`;

            scoreArray.push({
                el: scoreEl,
                data: data[id]
            });
        }

        scoreArray.sort((a, b) => {return a.data.kills < b.data.kills;});

        for (let x=0; x < scoreArray.length; x++){
            scoreArray[x].el.style.transform = `translateY(${x}rem)`;
        }
    }

    onKeyChange(e){
        if (this.playerShip) {
            if (e.keyName === 'up') {
                this.playerShip.actor.thrustEmitter.emit = e.isDown;
            }
        }
    }

    enableFullScreen(){
        let isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
            (document.mozFullScreen || document.webkitIsFullScreen);

        let docElm = document.documentElement;
        if (!isInFullScreen) {

            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            }
        }
    }

    //get current scene
    getScene(){
        //return this.game.scene.scenes[0];
        //console.log(this.game.scene.keys['default']); //loaded
        //console.log(this.game.scene.keys['default'].cameras.main);
        return this.game.scene.keys['default'];
    }

    //get current camera
    getCamera(){
        return this.game.scene.keys['default'].cameras.main;
    }

    //get current camera
    getCurrentCamera(){
        //this.camera = this.game.scene.keys['default'].cameras.main;
        this.camera = {x:0,y:0};
        //console.log(this.camera);
    }

}

function getCentroid(objects) {
    let maxDistance = 500; // max distance to add to the centroid
    let shipCount = 0;
    let centroid = { x: 0, y: 0 };
    let selectedShip = null;

    for (let id of Object.keys(objects)){
        let obj = objects[id];
        if (obj instanceof Ship) {
            if (selectedShip == null)
                selectedShip = obj;

            let objDistance = Math.sqrt( Math.pow((selectedShip.position.x-obj.position.y), 2) + Math.pow((selectedShip.position.y-obj.position.y), 2));
            if (selectedShip == obj || objDistance < maxDistance) {
                centroid.x += obj.position.x;
                centroid.y += obj.position.y;
                shipCount++;
            }
        }
    }

    centroid.x /= shipCount;
    centroid.y /= shipCount;


    return centroid;
}

// convenience function
function qs(selector) { return document.querySelector(selector);}

function truncateDecimals(number, digits) {
    let multiplier = Math.pow(10, digits);
    let adjustedNum = number * multiplier;
    let truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

    return truncatedNum / multiplier;
};

function isMacintosh() {
    return navigator.platform.indexOf('Mac') > -1;
}

function isWindows() {
    return navigator.platform.indexOf('Win') > -1;
}

