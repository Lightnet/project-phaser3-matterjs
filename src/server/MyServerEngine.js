'use strict';

const nameGenerator = require('./NameGenerator');

import ServerEngine from 'lance/ServerEngine';
import PlayerAvatar from '../common/PlayerAvatar';
const NUM_BOTS = 3;

export default class MyServerEngine extends ServerEngine {

    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        this.scoreData = {};
        
    }

    start() {
        super.start();
        //console.log("start game?");
        //this will make bots
        //for (let x = 0; x < NUM_BOTS; x++) this.makeBot();
        //start game init
        this.gameEngine.initGame();

        //event trigger when missile is hit from collision
        this.gameEngine.on('missileHit', e => {
            // add kills
            if (this.scoreData[e.missile.ownerId]) this.scoreData[e.missile.ownerId].kills++;
            // remove score data for killed ship
            delete this.scoreData[e.ship.id];
            this.updateScore();

            console.log(`ship killed: ${e.ship.toString()}`);
            this.gameEngine.removeObjectFromWorld(e.ship.id);
            if (e.ship.isBot) {
                setTimeout(() => this.makeBot(), 5000);
            }
        });
        //this.makeBot();
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);

        let makePlayerShip = () => {
            let ship = this.gameEngine.makeShip(socket.playerId);
            console.log("create ship");
            this.scoreData[ship.id] = {
                kills: 0,
                //name: "guest"//nameGenerator('general')
                name: nameGenerator('general')
            };
            this.updateScore();
        };

        //makePlayerShip();

        // handle client restart requests
        socket.on('requestRestart', makePlayerShip);

    }

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);

        // iterate through all objects, delete those that are associated with the player (ship and missiles)
        let playerObjects = this.gameEngine.world.queryObjects({ playerId: playerId});
        playerObjects.forEach( obj => {
            this.gameEngine.removeObjectFromWorld(obj.id);
            // remove score associated with this ship
            delete this.scoreData[obj.id];
        });

        this.updateScore();
    }

    makeBot() {
        let bot = this.gameEngine.makeShip(0);
        bot.attachAI();

        this.scoreData[bot.id] = {
            kills: 0,
            name: nameGenerator('general') + 'Bot'
        };

        this.updateScore();
    }

    updateScore() {
        // delay so player socket can catch up
        setTimeout(() => {
            this.io.sockets.emit('scoreUpdate', this.scoreData);
        }, 1000);
    }
}
