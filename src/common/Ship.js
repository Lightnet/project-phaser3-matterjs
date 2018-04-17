/*
    Information:
*/

import Serializer from 'lance/serialize/Serializer';
//import DynamicObject from 'lance/serialize/DynamicObject';

import Renderer from '../client/MyRenderer';
import ShipActor from '../client/ShipActor';
import TwoVector from 'lance/serialize/TwoVector';
import PhysicalObject2D from './PhysicalObject2D';

export default class Ship extends PhysicalObject2D {

    constructor(gameEngine, options, props){
        super(gameEngine, options, props);
        this.showThrust = 0;
        this.isBot = false;
        this.angle = 90;
    }

    get maxSpeed() { return 3.0; }
    
    onAddToWorld(gameEngine) {
        //console.log(gameEngine);
        //this.physicsObj = gameEngine.physicsEngine.addBox(this.position.x,this.position.y,{});
        this.physicsObj = gameEngine.physicsEngine.addCircle(this.position.x,this.position.y,{});

        this.physicsObj.gameObject = this;
        //gameEngine.physicsEngine.addGround(this.position.x,this.position.y,{});
        //this.physicsObj.force
        //console.log(this.position);
        //console.log(this.physicsObj);

        let renderer = Renderer.getInstance();
        if (renderer) {
            let shipActor = new ShipActor(renderer);
            let sprite = shipActor.sprite;
            renderer.sprites[this.id] = sprite;
            sprite.id = this.id;

            if (gameEngine.isOwnedByPlayer(this)) {
                renderer.addPlayerShip(sprite);
            } else {
                renderer.addOffscreenIndicator(this);
            }
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (this.fireLoop) {
            this.fireLoop.destroy();
        }

        if (this.onPreStep){
            this.gameEngine.removeListener('preStep', this.onPreStep);
            this.onPreStep = null;
        }
        
        let renderer = Renderer.getInstance();
        if (renderer) {
            if (gameEngine.isOwnedByPlayer(this)) {
                renderer.playerShip = null;
            } else {
                renderer.removeOffscreenIndicator(this);
            }
            let sprite = renderer.sprites[this.id];
            if (sprite) {
                if (sprite.actor) {
                    // removal "takes time"
                    sprite.actor.destroy().then(()=>{
                        //console.log('deleted sprite actor');
                        delete renderer.sprites[this.id];
                    });
                } else {
                    //console.log('deleted sprite');
                    sprite.destroy();
                    delete renderer.sprites[this.id];
                }
            }
        }

        //console.log("onRemoveFromWorld");
        //console.log(this);
        if(this.physicsObj){
            this.gameEngine.physicsEngine.removeObject(this.physicsObj);
        }
    }

    thrusterForward(){
        if(this.physicsObj){
            let Body = this.gameEngine.physicsEngine.Body;
            //let rad = this.physicsObj.angle;
            //console.log(this.physicsObj);
            //this.physicsObj.angle = this.angle;
            //let rad = this.angle;
            let rad = this.physicsObj.angle;
            let dv = new TwoVector();
            dv.set(Math.cos(rad), Math.sin(rad)).multiplyScalar(1);
            //console.log(dv);
            Body.setVelocity( this.physicsObj, {x: dv.x, y: dv.y});
            //Body.setVelocity( this.physicsObj, {x: 0.001, y: 0});
            //console.log(this.physicsObj.velocity);
            //Body.setAngularVelocity(this.physicsObj, 0);
            //Body.setVelocity( this.physicsObj, {x: 0, y: 0});
            //console.log("ship brake!");
        }
    }

    thrusterBrake(){
        if(this.physicsObj){
            let Body = this.gameEngine.physicsEngine.Body;
            //this.physicsObj
            this.velocity.x = 0;
            this.velocity.y = 0;
            Body.setAngularVelocity(this.physicsObj, 0);
            Body.setVelocity( this.physicsObj, {x: 0, y: 0});
            console.log("ship brake!");
            
        }
    }

    RotatingLeft(){
        if(this.physicsObj){
            this.angle -= this.rotationSpeed; 
            let Body = this.gameEngine.physicsEngine.Body;
            //console.log("isRotatingRight!",o.rotationSpeed);
            //o.physicsObj.angle += 0.01;
            //this.Body.rotate( o.physicsObj, Math.PI/6);
            let angle = this.rotationSpeed * Math.PI / 180;
            Body.rotate( this.physicsObj,angle * -1);
            //console.log(this.angle);
        }
    }

    RotatingRight(){
        if(this.physicsObj){
            this.angle += this.rotationSpeed;
            let Body = this.gameEngine.physicsEngine.Body;
            //console.log("isRotatingRight!",o.rotationSpeed);
            //o.physicsObj.angle += 0.01;
            //this.Body.rotate( o.physicsObj, Math.PI/6);
            let angle = this.rotationSpeed * Math.PI / 180;
            Body.rotate( this.physicsObj,angle);
            //console.log(this.angle);
        }
    }

    // ship rotation is input-deterministic, no bending needed
    get bendingAngleLocalMultiple() { return 0.0; }

    static get netScheme() {
        return Object.assign({
            showThrust: { type: Serializer.TYPES.INT32 }
        }, super.netScheme);
    }

    toString() {
        return `${this.isBot?'Bot':'Player'}::Ship::${super.toString()}`;
    }

    syncTo(other) {
        super.syncTo(other);
        this.showThrust = other.showThrust;
        //if (this.physicsObj)
            //this.refreshToPhysics();
    }

    // update position, quaternion, and velocity from new physical state.
    //refreshFromPhysics() {
        //2D
        //this.position.set(this.physicsObj.position.x,this.physicsObj.position.y);
        //this.angle = this.physicsObj.angle;
    //}

    // update position, quaternion, and velocity from new physical state.
    //refreshToPhysics() {
        //2D setup needed
        //console.log("refreshToPhysics");
        //this.physicsObj.position.x = this.position.x;
        //this.physicsObj.position.y = this.position.y;
        //this.physicsObj.angle = this.angle;
    //}

    destroy() {
        console.log("Ship Destroy");
        //console.log(this);
    }

    attachAI() {
        this.isBot = true;

        this.onPreStep = () => {
            this.steer();
        };

        this.gameEngine.on('preStep', this.onPreStep);

        let fireLoopTime = Math.round(250 + Math.random() * 100);
        this.fireLoop = this.gameEngine.timer.loop(fireLoopTime, () => {
            if (this.target && this.distanceToTargetSquared(this.target) < 160000) {
                this.gameEngine.makeMissile(this);
            }
        });
    }

    shortestVector(p1, p2, wrapDist) {
        let d = Math.abs(p2 - p1);
        if (d > Math.abs(p2 + wrapDist - p1)) p2 += wrapDist;
        else if (d > Math.abs(p1 + wrapDist - p2)) p1 += wrapDist;
        return p2 - p1;
    }

    distanceToTargetSquared(target) {
        let dx = this.shortestVector(this.position.x, target.position.x, this.gameEngine.worldSettings.width);
        let dy = this.shortestVector(this.position.y, target.position.y, this.gameEngine.worldSettings.height);
        return dx * dx + dy * dy;
    }

    steer() {
        let closestTarget = null;
        let closestDistance2 = Infinity;
        for (let objId of Object.keys(this.gameEngine.world.objects)) {
            let obj = this.gameEngine.world.objects[objId];
            if (obj != this) {
                let distance2 = this.distanceToTargetSquared(obj);
                if (distance2 < closestDistance2) {
                    closestTarget = obj;
                    closestDistance2 = distance2;
                }
            }
        }

        this.target = closestTarget;

        if (this.target) {

            let newVX = this.shortestVector(this.position.x, this.target.position.x, this.gameEngine.worldSettings.width);
            let newVY = this.shortestVector(this.position.y, this.target.position.y, this.gameEngine.worldSettings.height);
            let angleToTarget = Math.atan2(newVX, newVY)/Math.PI* 180;
            angleToTarget *= -1;
            angleToTarget += 90; // game uses zero angle on the right, clockwise
            if (angleToTarget < 0) angleToTarget += 360;
            let turnRight = this.shortestVector(this.angle, angleToTarget, 360);

            if (turnRight > 4) {
                this.isRotatingRight = true;
            } else if (turnRight < -4) {
                this.isRotatingLeft = true;
            } else {
                this.isAccelerating = true;
                this.showThrust = 5;
            }

        }
    }
}