import Serializer from 'lance/serialize/Serializer';
import DynamicObject from 'lance/serialize/DynamicObject';
import Renderer from '../client/MyRenderer';


export default class Missile extends DynamicObject {

    constructor(gameEngine, options, props){
        super(gameEngine, options, props);
        this.typeobject = "projectile";
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
        let Body = gameEngine.physicsEngine.Body;

        this.physicsObj = gameEngine.physicsEngine.addProjectile(this.position.x,this.position.y,{});
        this.physicsObj.gameObject = this;

        Body.setPosition(this.physicsObj,{x:this.position.x,y:this.position.y});


        //this.physicsObj.angle = this.angle;
        //this.physicsObj.velocity.x = this.velocity.x;
        //this.physicsObj.velocity.y = this.velocity.y;
        //console.log(this.physicsObj);

        let renderer = Renderer.getInstance();
        if (renderer) {
            let scene = renderer.getScene();//get current index scenes
            let sprite = scene.add.image(10, 10, 'shot');
            renderer.sprites[this.id] = sprite; //assign id for render sprites array
            sprite.x = this.position.x;
            sprite.y = this.position.y;
        }
    }

    onRemoveFromWorld(gameEngine) {
        let renderer = Renderer.getInstance();
        if (renderer && renderer.sprites[this.id]) {
            renderer.sprites[this.id].destroy();
            delete renderer.sprites[this.id];
        }

        if(this.physicsObj){
            this.gameEngine.physicsEngine.removeObject(this.physicsObj);
        }
    }

    syncTo(other) {
        super.syncTo(other);
        this.inputId = other.inputId;
    }

    // update position, quaternion, and velocity from new physical state.
    refreshFromPhysics() {
        //2D
        this.position.set(this.physicsObj.position.x,this.physicsObj.position.y);
        //this.angle = this.physicsObj.angle;
        //console.log(this.physicsObj.angle);
        //console.log("sync?");
    }

    // update position, quaternion, and velocity from new physical state.
    refreshToPhysics() {
        //2D setup needed
        //console.log("refreshToPhysics");
        this.physicsObj.position.x = this.position.x;
        this.physicsObj.position.y = this.position.y;

        //this.physicsObj.angle = this.angle;
    }



}