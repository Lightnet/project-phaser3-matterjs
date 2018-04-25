/*
 Information: This game engine where physics are setup.
*/

'use strict';
//import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
//import PlayerAvatar from './PlayerAvatar';
import MatterPhysicsEngine from './MatterPhysicsEngine';
import GameEngine from 'lance/GameEngine';
import TwoVector from 'lance/serialize/TwoVector';

import Ship from './Ship';
import Missile from './Missile';
import MJRectangle from './MJRectangle';
import MJCircle from './MJCircle';
import MObjectDeploy from './MObjectDeploy';

//import MGround from './MGround';

const WIDTH = 400;
const HEIGHT = 400;

export default class MyGameEngine extends GameEngine {

    constructor(options) {
        super(options);
        //this.physicsEngine = new SimplePhysicsEngine({ gameEngine: this });
        //console.log(options);
        this.bphysicsdebug = options.bphysicsdebug || false;//for client render debug
        this.physicsEngine = new MatterPhysicsEngine({ gameEngine: this });

        //this.physicsEngine.setupMatterEvents();
    }

    registerClasses(serializer) {
        serializer.registerClass(Ship);
        serializer.registerClass(Missile);
        serializer.registerClass(MJRectangle);
        serializer.registerClass(MJCircle);
        serializer.registerClass(MObjectDeploy);
        //serializer.registerClass(MGround);
    }

    initWorld(){
        super.initWorld({
            worldWrap: true,
            width: 3000,
            height: 3000
        });
        console.log("init world");
        this.physicsEngine.setupMatterEvents();
    }

    start() {
        super.start();
        //console.log("start game!");
        //matterjs event same as spaace event.
        this.on('collisionStart', e => {
            let collisionObjects = Object.keys(e).map(k => e[k]);
            let ship = collisionObjects.find(o => o instanceof Ship);
            let missile = collisionObjects.find(o => o instanceof Missile);
            
            if (!ship || !missile)
                return;

            // make sure not to process the collision between a missile and the ship that fired it
            if (missile.playerId !== ship.playerId) {
                //console.log("collisionStart >>>>> ");
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
                playerShip.thrusterForward();
                //console.log(playerShip);
            } else if (inputData.input == 'right') {
                //playerShip.isRotatingRight = true;
                playerShip.RotatingRight();
                //console.log("right key");
            } else if (inputData.input == 'left') {
                //playerShip.isRotatingLeft = true;
                playerShip.RotatingLeft();
            } else if (inputData.input == 'brake') {
                playerShip.thrusterBrake();
                console.log("brake");
            }else if (inputData.input == 'space') {
                //console.log("fire missile");
                this.makeMissile(playerShip, inputData.messageIndex);
                this.emit('fireMissile');
            }else if (inputData.input == 'deploy') {
                //console.log("fire missile");
                this.makeObjectDeploy(playerShip, inputData.messageIndex);

                //this.makeMissile(playerShip, inputData.messageIndex);
                //this.emit('fireMissile');
            }
            //playerShip.refreshFromPhysics();
        }
    }

    initGame() {
        //this.makeShip(0);
        //this.physicsEngine.addGround(0, 0, {});
        //console.log(this.physicsEngine);
        console.log("init game!");

        this.addObjectToWorld(new MJRectangle(this, null, {position: new TwoVector(400, 600)}));

        //this.addship(0);
    }

    addship(playerId){
        let ship = new Ship(this, null, {position: new TwoVector(200, 200)});
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

    makeObjectDeploy(playerShip,inputId){
        let objectDeploy = new MObjectDeploy(this,null,{position:playerShip.physicsObj.position});

        objectDeploy.angle = playerShip.angle;
        objectDeploy.playerId = playerShip.playerId;
        objectDeploy.ownerId = playerShip.id;
        objectDeploy.inputId = inputId; 

        //this.trace.trace(() => `missile[${objectDeploy.id}] created vel=${objectDeploy.velocity}`);
        let obj = this.addObjectToWorld(objectDeploy);
        //if (obj)
            //this.timer.add(30, this.objectDeploy, this, [obj.id]);
        return objectDeploy;
    }

    makeMissile(playerShip, inputId) {
        //let missile = new Missile(this,null,{position:};
        let missile = new Missile(this,null,{position:playerShip.physicsObj.position});
        // we want the missile location and velocity to correspond to that of the ship firing it
        //missile.position.copy(playerShip.position);
        //missile.position.x = playerShip.physicsObj.position.x;
        //missile.position.y = playerShip.physicsObj.position.y;
        console.log("playerShip:",playerShip.position);
        console.log("physics:",playerShip.physicsObj.position);
        //missile.velocity.copy(playerShip.velocity);
        missile.angle = playerShip.angle;
        missile.playerId = playerShip.playerId;
        missile.ownerId = playerShip.id;
        missile.inputId = inputId; // this enables usage of the missile shadow object
        //missile.velocity.x += Math.cos(missile.angle * (Math.PI / 180)) * 10;
        //missile.velocity.y += Math.sin(missile.angle * (Math.PI / 180)) * 10;
        //this one radian
        //missile.velocity.x += Math.cos(missile.angle) * 10;
        //missile.velocity.y += Math.sin(missile.angle) * 10;
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

