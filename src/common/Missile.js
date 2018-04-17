import Serializer from 'lance/serialize/Serializer';
import DynamicObject from 'lance/serialize/DynamicObject';
import PhysicalObject2D from './PhysicalObject2D';

import Renderer from '../client/MyRenderer';
import TwoVector from 'lance/serialize/TwoVector';

//export default class Missile extends DynamicObject {
export default class Missile extends PhysicalObject2D {    

    constructor(gameEngine, options, props){
        super(gameEngine, options, props);
        
    }

    // this is what allows usage of shadow object with input-created objects (missiles)
    // see https://medium.com/javascript-multiplayer-gamedev/chronicles-of-the-development-of-a-multiplayer-game-part-2-loops-and-leaks-10b453e843e0
    // in the future this will probably be embodied in a component

    static get netScheme() {
        return Object.assign({
            inputId: { type: Serializer.TYPES.INT32 }
        }, super.netScheme);
    }

    onAddToWorld(gameEngine) {
        //create physics body
        this.createBodyPhysics();

        let renderer = Renderer.getInstance();
        if (renderer) {
            let scene = renderer.getScene();//get current index scenes
            let sprite = this.sprite = scene.add.image(this.position.x, this.position.y, 'shot');
            renderer.sprites[this.id] = sprite; //assign id for render sprites array
            //sprite.x = this.position.x;
            //sprite.y = this.position.y;
        }
    }

    createBodyPhysics(){
        let Body = this.gameEngine.physicsEngine.Body;

        this.physicsObj = this.gameEngine.physicsEngine.addProjectile(this.position.x,this.position.y,{});
        this.physicsObj.gameObject = this;
        //console.log("projectile: ",this.physicsObj.position);
        //Body.setPosition(this.physicsObj,{x:this.position.x,y:this.position.y});
        let rad = this.angle;

        //let rad = Math.PI/180 * this.angle;
        
        //this.physicsObj.angle = this.angle;
        //let dv = new TwoVector();
        //dv.set(Math.cos(rad), Math.sin(rad)).multiplyScalar(5);
        //dv.set(Math.cos(rad), Math.sin(rad));

        let dv = {
            x:Math.cos(this.angle),
            y:Math.sin(this.angle)
        };

        console.log("dv =====================");
        console.log("this.angle",this.angle);
        console.log("dv:",dv);
        //Body.setVelocity( this.physicsObj, {x: dv.x, y: dv.y});
        //Body.setVelocity( this.physicsObj, {x: 0, y: 0.01});
        //console.log(this.physicsObj);
    }

    onRemoveFromWorld(gameEngine) {
        let renderer = Renderer.getInstance();
        if (renderer && renderer.sprites[this.id]) {
            if(this.sprite){
                this.sprite.destroy();
            }
            console.log("delete? missile");
            console.log(renderer.sprites[this.id]);
            renderer.sprites[this.id].destroy();
            delete renderer.sprites[this.id];
        }

        if(this.physicsObj){
            this.gameEngine.physicsEngine.removeObject(this.physicsObj);
        }
    }

    destroy() {
        console.log("missle Destroy");
        //console.log(this);
    }

    syncTo(other) {
        super.syncTo(other);
        this.inputId = other.inputId;
        this.angle = other.angle;
        //if (this.physicsObj)
            //this.refreshToPhysics();
    }

    // update position, quaternion, and velocity from new physical state.
    //refreshFromPhysics() {
        //2D
        //this.position.set(this.physicsObj.position.x,this.physicsObj.position.y);
        //this.angle = this.physicsObj.angle;
        //this.velocity.x = this.physicsObj.velocity.x;
        //this.velocity.y = this.physicsObj.velocity.y;
        //console.log(this.physicsObj.angle);
        //console.log("sync?");
    //}

    // update position, quaternion, and velocity from new physical state.
    //refreshToPhysics() {
        //2D setup needed
        //console.log("refreshToPhysics");
        //this.physicsObj.position.x = this.position.x;
        //this.physicsObj.position.y = this.position.y;
        //this.physicsObj.angle = this.angle;
        //this.physicsObj.velocity.x = this.velocity.x;
        //this.physicsObj.velocity.y = this.velocity.y;
    //}
}