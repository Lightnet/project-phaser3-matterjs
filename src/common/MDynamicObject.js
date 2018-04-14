import Serializer from 'lance/serialize/Serializer';
import DynamicObject from 'lance/serialize/DynamicObject';
import Renderer from '../client/MyRenderer';

export default class MDynamicObject extends DynamicObject {
    
    constructor(gameEngine, options, props){
        super(gameEngine, options, props);
        //this.showThrust = 0;
        //this.angle = 0;
    }

    // update position, quaternion, and velocity from new physical state.
    refreshFromPhysics() {
        //2D
        this.position.set(this.physicsObj.position.x,this.physicsObj.position.y);
        this.angle = this.physicsObj.angle;

        //3D
        //this.position.copy(this.physicsObj.position);
        //this.quaternion.copy(this.physicsObj.quaternion);
        //this.velocity.copy(this.physicsObj.velocity);
        //this.angularVelocity.copy(this.physicsObj.angularVelocity);
    }

    // update position, quaternion, and velocity from new physical state.
    refreshToPhysics() {
        //2D setup needed
        //console.log("refreshToPhysics");
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