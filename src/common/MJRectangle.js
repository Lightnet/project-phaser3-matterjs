/*

*/

import Serializer from 'lance/serialize/Serializer';
import DynamicObject from 'lance/serialize/DynamicObject';
import Renderer from '../client/MyRenderer';

export default class MJRectangle extends DynamicObject {

    constructor(gameEngine, options, props){
        super(gameEngine, options, props);
        this.showThrust = 0;
        this.isBot = false;
        this.angle = 0;
    }

    onAddToWorld(gameEngine) {
        //console.log(gameEngine);
        let options = {
            width:800,
            height:60,
            params:{ 
                isSensor: true,
                isStatic: true 
            }
        };
        this.physicsObj = gameEngine.physicsEngine.addBox(this.position.x,this.position.y, options);
        this.physicsObj.gameObject = this;
    }

    onRemoveFromWorld(gameEngine) {
        if(this.physicsObj){
            this.gameEngine.physicsEngine.removeObject(this.physicsObj);
        }
    }

    // update position, quaternion, and velocity from new physical state.
    refreshFromPhysics() {
        //2D
        this.position.set(this.physicsObj.position.x,this.physicsObj.position.y);
        this.angle = this.physicsObj.angle;
    }

    // update position, quaternion, and velocity from new physical state.
    refreshToPhysics() {
        //2D setup needed
        this.physicsObj.position.x = this.position.x;
        this.physicsObj.position.y = this.position.y;
        this.physicsObj.angle = this.angle;

        //3D
        //this.physicsObj.position.copy(this.position);
        //this.physicsObj.quaternion.copy(this.quaternion);
        //this.physicsObj.velocity.copy(this.velocity);
        //this.physicsObj.angularVelocity.copy(this.angularVelocity);
    }
    
}