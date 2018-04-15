/*
 Information: Game client setup handle scoket.io connections and events from users inputs.
*/


import ClientEngine from 'lance-gg/ClientEngine';
import KeyboardControls from 'lance-gg/controls/KeyboardControls';
import MobileControls from './MobileControls';
import MyRenderer from '../client/MyRenderer';

import Utils from '../common/Utils';
import Ship from '../common/Ship';

export default class MyClientEngine extends ClientEngine {

    constructor(gameEngine, options) {
        super(gameEngine, options, MyRenderer);
    }
    
    start() {
        super.start();
        //console.log("client engine!");
        // handle gui for game condition
        this.gameEngine.on('objectDestroyed', (obj) => {
            if (obj instanceof Ship && this.gameEngine.isOwnedByPlayer(obj)) {
                //console.log("Call defeat!");
                document.body.classList.add('lostGame');
                document.querySelector('#tryAgain').disabled = false;
            }
        });

        this.gameEngine.on('join', (obj) => {
            this.socket.emit('requestRestart');
        });

        //This handle UI add listener controls and html buttons.
        this.gameEngine.once('renderer.ready', () => {
            //console.log("Renderer Ready!");
            // click event for "try again" button
            document.querySelector('#tryAgain').addEventListener('click', () => {
                if (Utils.isTouchDevice()){
                    this.renderer.enableFullScreen();
                }
                this.socket.emit('requestRestart');
            });
            
            document.querySelector('#joinGame').addEventListener('click', (clickEvent) => {
                if (Utils.isTouchDevice()){
                    this.renderer.enableFullScreen();
                }
                document.querySelector('#joinGame').style.display = 'none';
                //console.log(clickEvent.currentTarget);
                //clickEvent.currentTarget.disabled = true;
                //window.focus();
                //document.querySelector('#phaser-app').focus();
                //setTimeout(()=>{ 
                    //alert("Hello"); 
                    //document.getElementById("phaser-app").focus();
                    //console.log("focus?");
                //}, 1000);
                //console.log("hello start?");
                this.socket.emit('requestRestart');
                //console.log("join game?");
            });
            
            document.querySelector('#reconnect').addEventListener('click', () => {
                window.location.reload();
            });
            
            //  Game input
            if (Utils.isTouchDevice()){
                this.controls = new MobileControls(this.renderer);
            } else {
                this.controls = new KeyboardControls(this.renderer);
                //console.log("default controls");
            }

            this.controls = new KeyboardControls(this);
            this.controls.bindKey('left', 'left', { repeat: true });
            this.controls.bindKey('right', 'right', { repeat: true });
            this.controls.bindKey('up', 'up', { repeat: true } );
            this.controls.bindKey('space', 'space');

            this.controls.bindKey('c', 'brake');
            this.controls.bindKey('b', 'deploy');

            this.controls.on('fire', () => {
                console.log("spacebar");
                this.sendInput('space');
            });

        });
        //play sound when user fire missle
        this.gameEngine.on('fireMissile', () => { 
            if(this.renderer.scene){
                //console.log(this.renderer.scene);
                this.renderer.scene.soundFX_lasergun.play();
            }
        });
        //play sound when ship is hit event
        this.gameEngine.on('missileHit', () => {
            // don't play explosion sound if the player is not in game
            if (this.renderer.playerShip) {
                if(this.renderer.scene){
                    this.renderer.scene.soundFX_projectilehit.play();
                }
            }
        });
        //this update ping to server lag rate
        this.networkMonitor.on('RTTUpdate', (e) => {
            this.renderer.updateHUD(e);
        });
    }

    // extend ClientEngine connect to add own events
    connect() {
        return super.connect().then(() => {
            //this update ship data score UI
            this.socket.on('scoreUpdate', (e) => {
                this.renderer.updateScore(e);
            });

            this.socket.on('disconnect', (e) => {
                //console.log('disconnected');
                document.body.classList.add('disconnected');
                document.body.classList.remove('gameActive');
                document.querySelector('#reconnect').disabled = false;
            });

            if ('autostart' in Utils.getUrlVars()) {
                this.socket.emit('requestRestart');
            }
        });
    }
}
