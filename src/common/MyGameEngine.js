'use strict';

import TwoVector from 'lance/serialize/TwoVector';

import Ship from './Ship';
import Missile from './Missile';

const PADDING = 20;
const WIDTH = 400;
const HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 50;

import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';

import matterPhysicsEngine from './matterPhysicsEngine';

//import PlayerAvatar from './PlayerAvatar';

export default class MyGameEngine extends GameEngine {

    constructor(options) {
        super(options);
        //this.physicsEngine = new SimplePhysicsEngine({ gameEngine: this });

        //this.physicsEngine = new SimplePhysicsEngine({
            //gameEngine: this,
            //collisions: {
                //type: 'brute'
            //}
        //});

        this.physicsEngine = new matterPhysicsEngine({ gameEngine: this });

        let engine = this.physicsEngine.engine;
        let Events = this.physicsEngine.Events;
        let Composite = this.physicsEngine.Composite;

        Events.on(engine, 'collisionStart', function(event) {
            var pairs = event.pairs;
            // change object colours to show those starting a collision
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                //pair.bodyA.render.fillStyle = '#333';
                //pair.bodyB.render.fillStyle = '#333';
                console.log("collisionStart");
            }
        });

        // an example of using collisionActive event on an engine
        Events.on(engine, 'collisionActive', function(event) {
            var pairs = event.pairs;

            // change object colours to show those in an active collision (e.g. resting contact)
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                //pair.bodyA.render.fillStyle = '#333';
                //pair.bodyB.render.fillStyle = '#333';
                //console.log("collisionActive");
            }
        });

        // an example of using collisionEnd event on an engine
        Events.on(engine, 'collisionEnd', function(event) {
            var pairs = event.pairs;

            // change object colours to show those ending a collision
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];

                //pair.bodyA.render.fillStyle = '#222';
                //pair.bodyB.render.fillStyle = '#222';
                //console.log("collisionEnd");
            }
        });

        // an example of using beforeUpdate event on an engine
        Events.on(engine, 'beforeUpdate', function(event) {
            //var engine = event.source;
            var bodies = Composite.allBodies(engine.world);
            //console.log(bodies);
            //console.log("update?");
            for (var i = 0; i < bodies.length; i += 1) {
                if(bodies[i].id == 1){
                    //console.log(bodies[i].position);
                }
            }
            // apply random forces every 5 secs
            //if (event.timestamp % 5000 < 50)
                //shakeScene(engine);
        });
        //console.log(this.physicsEngine);
    }

    registerClasses(serializer) {
        serializer.registerClass(Ship);
        serializer.registerClass(Missile);
    }

    initWorld(){
        super.initWorld({
            worldWrap: true,
            width: 3000,
            height: 3000
        });
    }

    start() {
        super.start();
        this.on('collisionStart', e => {
            let collisionObjects = Object.keys(e).map(k => e[k]);
            let ship = collisionObjects.find(o => o instanceof Ship);
            let missile = collisionObjects.find(o => o instanceof Missile);

            if (!ship || !missile)
                return;

            // make sure not to process the collision between a missile and the ship that fired it
            if (missile.playerId !== ship.playerId) {
                this.destroyMissile(missile.id);
                this.trace.info(() => `missile by ship=${missile.playerId} hit ship=${ship.id}`);
                this.emit('missileHit', { missile, ship });
            }
        });

        this.on('postStep', this.reduceVisibleThrust.bind(this));

        //this.on('objectAdded', (object) => {});
    }

    processInput(inputData, playerId) {

        super.processInput(inputData, playerId);

        // get the player ship tied to the player socket
        let playerShip = this.world.queryObject({
            playerId: playerId,
            instanceType: Ship
        });
        //console.log(playerShip.position);
        //console.log(inputData.input);

        if (playerShip) {
            if (inputData.input == 'up') {
                playerShip.isAccelerating = true;
                playerShip.showThrust = 5; // show thrust for next steps.
                //console.log(playerShip);
            } else if (inputData.input == 'right') {
                playerShip.isRotatingRight = true;
                console.log("right key");
            } else if (inputData.input == 'left') {
                playerShip.isRotatingLeft = true;
            } else if (inputData.input == 'space') {
                //console.log("fire missile");
                this.makeMissile(playerShip, inputData.messageIndex);
                this.emit('fireMissile');
            }
            //playerShip.refreshFromPhysics();
        }
    }

    initGame() {
        //this.makeShip(0);
        //this.physicsEngine.addGround(0, 0, {});
        //console.log(this.physicsEngine);
        console.log("init game!");
    }

    addship(playerId){
        let ship = new Ship(this, null, {position: new TwoVector(400, 600)});
        ship.playerId = playerId;
        this.addObjectToWorld(ship);
        //console.log(`ship added: ${ship.toString()}`);
        return ship;
    }

    makeShip(playerId){
        let newShipX = Math.floor(Math.random()*(this.worldSettings.width-200)) + 200;
        let newShipY = Math.floor(Math.random()*(this.worldSettings.height-200)) + 200;
        //let ship = new Ship(this, null, {
            //position: new TwoVector(newShipX, newShipY)
        //});

        let ship = new Ship(this, null, {position: new TwoVector(400, 200)});
        
        ship.playerId = playerId;
        this.addObjectToWorld(ship);
        //console.log(`ship added: ${ship.toString()}`);
        return ship;
    }

    makeMissile(playerShip, inputId) {
        let missile = new Missile(this);

        // we want the missile location and velocity to correspond to that of the ship firing it
        missile.position.copy(playerShip.position);
        missile.velocity.copy(playerShip.velocity);
        missile.angle = playerShip.angle;
        missile.playerId = playerShip.playerId;
        missile.ownerId = playerShip.id;
        missile.inputId = inputId; // this enables usage of the missile shadow object
        missile.velocity.x += Math.cos(missile.angle * (Math.PI / 180)) * 10;
        missile.velocity.y += Math.sin(missile.angle * (Math.PI / 180)) * 10;

        this.trace.trace(() => `missile[${missile.id}] created vel=${missile.velocity}`);

        let obj = this.addObjectToWorld(missile);

        // if the object was added successfully to the game world, destroy the missile after some game ticks
        if (obj)
            this.timer.add(30, this.destroyMissile, this, [obj.id]);

        return missile;
    }

    // destroy the missile if it still exists
    destroyMissile(missileId) {
        if (this.world.objects[missileId]) {
            this.trace.trace(() => `missile[${missileId}] destroyed`);
            this.removeObjectFromWorld(missileId);
        }
    }

    // at the end of the step, reduce the thrust for all objects
    reduceVisibleThrust(postStepEv) {
        if (postStepEv.isReenact)
            return;

        let ships = this.world.queryObjects({
            instanceType: Ship
        });

        ships.forEach(ship => {
            if (Number.isInteger(ship.showThrust) && ship.showThrust >= 1)
                ship.showThrust--;
        });
    }
    
}
