/*
    Information:
*/

import Serializer from 'lance/serialize/Serializer';
import DynamicObject from 'lance/serialize/DynamicObject';

import Renderer from '../client/MyRenderer';
import ShipActor from '../client/ShipActor';
import TwoVector from 'lance/serialize/TwoVector';
import PhysicalObject2D from './PhysicalObject2D';

export default class Ship extends PhysicalObject2D {

    constructor(gameEngine, options, props){
        super(gameEngine, options, props);
        this.showThrust = 0;
        this.isBot = false;

        //this.rotationSpeed = 2.5;
        this.rotationSpeed = 0.01;
        //this.angle = 90;
    }

    get maxSpeed() { return 3.0; }
    
    onAddToWorld(gameEngine) {
        this.Body = gameEngine.physicsEngine.Body;
        //console.log(gameEngine);
        //this.physicsObj = gameEngine.physicsEngine.addBox(this.position.x,this.position.y,{});
        this.physicsObj = gameEngine.physicsEngine.addCircle(this.position.x,this.position.y,{});
        this.physicsObj.gameObject = this;

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
            //this.physicsObj.angle;

            let rad = this.physicsObj.angle;
            //let rad = this.physicsObj.angle;
            let dv = new TwoVector();
            //dv.set(Math.cos(rad), Math.sin(rad)).multiplyScalar(0.01);
            dv.set(Math.cos(rad), Math.sin(rad)).multiplyScalar(1);
            //console.log(dv);

            //this.physicsObj.velocity.x = dv.x;
            //this.physicsObj.velocity.y = dv.y;
            //console.log(this.physicsObj);
            //Body.setAngularVelocity( this.physicsObj, this.angle);
            //if(this.physicsObj.velocity.x == 0){
                //Body.setVelocity( this.physicsObj, {x: 0.001, y: 0});
                Body.setVelocity( this.physicsObj, {x: dv.x, y: dv.y});
            //}
            //console.log("this.physicsObj.velocity",this.physicsObj.velocity);
            //console.log("this.physicsObj.position",this.physicsObj.position);
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
            this.physicsObj.angle = 0;
        }
    }

    RotatingLeft(){
        this.RotateShip(-1);
    }

    RotatingRight(){
        this.RotateShip(1);
    }

    RotateShip(dir){
        if(this.physicsObj){
            let Body = this.gameEngine.physicsEngine.Body;
            let angle = Math.PI / 180 * dir;
            //console.log(angle);
            //Body.rotate( this.physicsObj, 0.001 * dir );
            //this.angle = this.angle + 0.1 * dir;
            //this.physicsObj.angle = this.physicsObj.angle + 0.01 * dir;
            Body.setAngularVelocity(this.physicsObj, angle);
            //console.log("this.angle", this.angle);
            //console.log("this.physicsObj.angle", this.physicsObj.angle);
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