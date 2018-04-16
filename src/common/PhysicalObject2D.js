import Serializer from 'lance/serialize/Serializer';
import GameObject from 'lance/serialize/GameObject';
import Renderer from '../client/MyRenderer';
import TwoVector from 'lance/serialize/TwoVector';

//not build yet...
export default class PhysicalObject2D extends GameObject {

    static get netScheme() {
        return Object.assign({
            playerId: { type: Serializer.TYPES.INT16 },
            position: { type: Serializer.TYPES.CLASSINSTANCE },
            angle: { type: Serializer.TYPES.FLOAT32 },
            velocity: { type: Serializer.TYPES.CLASSINSTANCE },
            angularVelocity: { type: Serializer.TYPES.CLASSINSTANCE }
        }, super.netScheme);
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options);

        /**
        * ID of player who created this object
        * @member {Number}
        */
        this.playerId = 0;

        this.bendingIncrements = 0;

        this.position = new TwoVector(0, 0);
        this.velocity = new TwoVector(0, 0);
        this.angularVelocity = new TwoVector(0, 0);

        /**
        * object orientation angle in degrees
        * @member {Number}
        */
        this.angle = 90;

        /**
        * should rotate left by {@link DynamicObject#rotationSpeed} on next step
        * @member {Boolean}
        */
       this.isRotatingLeft = false;

       /**
       * should rotate right by {@link DynamicObject#rotationSpeed} on next step
       * @member {Boolean}
       */
       this.isRotatingRight = false;

       /**
       * should accelerate by {@link DynamicObject#acceleration} on next step
       * @member {Boolean}
       */
       this.isAccelerating = false;

       /**
       * angle rotation per step
       * @member {Number}
       */
       this.rotationSpeed = 2.5;

       /**
       * acceleration per step
       * @member {Number}
       */
       this.acceleration = 0.1;

        // use values if provided
        props = props || {};

        props = props || {};
        if (props.position) this.position.copy(props.position);
        if (props.velocity) this.velocity.copy(props.velocity);
        //if (props.quaternion) this.quaternion.copy(props.quaternion);
        if (props.angularVelocity) this.angularVelocity.copy(props.angularVelocity);

        this.class = PhysicalObject2D;
    }

    /**
     * Formatted textual description of the dynamic object.
     * The output of this method is used to describe each instance in the traces,
     * which significantly helps in debugging.
     *
     * @return {String} description - a string describing the DynamicObject
     */
    toString() {
        let p = this.position.toString();
        let v = this.velocity.toString();
        let q = this.angle.toString();
        let a = this.angularVelocity.toString();
        return `phyObj[${this.id}] player${this.playerId} Pos=${p} Vel=${v} angle=${q} AVel=${a}`;
    }

    // display object's physical attributes as a string
    // for debugging purposes mostly
    bendingToString() {
        if (this.bendingIncrements)
            return `bend=${this.bending} increments=${this.bendingIncrements} deltaPos=${this.bendingPositionDelta} deltaQuat=${this.bendingQuaternionDelta}`;
        return 'no bending';
    }

    bendToCurrent(original, bending, worldSettings, isLocal, bendingIncrements) {

        // get the incremental delta position
        this.incrementScale = bending / bendingIncrements;
        this.bendingPositionDelta = (new TwoVector()).copy(this.position);
        this.bendingPositionDelta.subtract(original.position);
        this.bendingPositionDelta.multiplyScalar(this.incrementScale);

        // get the incremental angular-velocity
        this.bendingAVDelta = (new TwoVector()).copy(this.angularVelocity);
        this.bendingAVDelta.subtract(original.angularVelocity);
        this.bendingAVDelta.multiplyScalar(this.incrementScale);

        // get the incremental quaternion rotation
        //let currentConjugate = (new Quaternion()).copy(original.quaternion).conjugate();
        //this.bendingQuaternionDelta = (new Quaternion()).copy(this.quaternion);
        //this.bendingQuaternionDelta.multiply(currentConjugate);
        //let axisAngle = this.bendingQuaternionDelta.toAxisAngle();
        //axisAngle.angle *= this.incrementScale;
        //this.bendingQuaternionDelta.setFromAxisAngle(axisAngle.axis, axisAngle.angle);

        this.bendingTarget = (new this.constructor());
        this.bendingTarget.syncTo(this);
        this.syncTo(original, { keepVelocity: true });
        this.bendingIncrements = bendingIncrements;
        this.bending = bending;

        // TODO: use configurable physics bending
        // TODO: does refreshToPhysics() really belong here?
        //       should refreshToPhysics be decoupled from syncTo
        //       and called explicitly in all cases?
        this.refreshToPhysics();
    }

    syncTo(other, options) {
        super.syncTo(other);
        this.position.copy(other.position);
        //this.quaternion.copy(other.quaternion);
        this.rotationSpeed = other.rotationSpeed;
        this.acceleration = other.acceleration;
        this.angularVelocity.copy(other.angularVelocity);

        if (!options || !options.keepVelocity) {
            this.velocity.copy(other.velocity);
        }

        if (this.physicsObj)
            this.refreshToPhysics();
    }

    // update position, quaternion, and velocity from new physical state.
    refreshFromPhysics() {
        //this.position.copy(this.physicsObj.position);

        this.position.set(this.physicsObj.position.x,this.physicsObj.position.y);
        console.log(this.position);
        //this.quaternion.copy(this.physicsObj.quaternion);
        //this.velocity.copy(this.physicsObj.velocity);
        //this.angularVelocity.copy(this.physicsObj.angularVelocity);
    }

    // update position, quaternion, and velocity from new physical state.
    refreshToPhysics() {
        this.physicsObj.position.x = this.position.x;
        this.physicsObj.position.y = this.position.y;

        //this.physicsObj.velocity.x = this.velocity.x;
        //this.physicsObj.velocity.y = this.velocity.y;

        //this.physicsObj.angularVelocity.x = this.angularVelocity.x;
        //this.physicsObj.angularVelocity.y = this.angularVelocity.y;

        //this.physicsObj.position.copy(this.position);
        //this.physicsObj.quaternion.copy(this.quaternion);
        //this.physicsObj.velocity.copy(this.velocity);
        //this.physicsObj.angularVelocity.copy(this.angularVelocity);
    }

    // apply one increment of bending
    applyIncrementalBending(stepDesc) {
        if (this.bendingIncrements === 0)
            return;

        if (stepDesc && stepDesc.dt) {
            const timeFactor = stepDesc.dt / (1000 / 60);
            const posDelta = (new TwoVector()).copy(this.bendingPositionDelta).multiplyScalar(timeFactor);
            const avDelta = (new TwoVector()).copy(this.bendingAVDelta).multiplyScalar(timeFactor);
            this.position.add(posDelta);
            this.angularVelocity.add(avDelta);

            // TODO: this is an unacceptable workaround that must be removed.  It solves the
            // jitter problem by applying only three steps of slerp (thus avoiding slerp to back in time
            // instead of solving the problem with a true differential quaternion
            if (this.bendingIncrements > 3) {
                //this.quaternion.slerp(this.bendingTarget.quaternion, this.incrementScale * timeFactor * 0.6);
            }
        } else {
            this.position.add(this.bendingPositionDelta);
            this.angularVelocity.add(this.bendingAVDelta);
            //this.quaternion.slerp(this.bendingTarget.quaternion, this.incrementScale);
        }

        // TODO: the following approach is encountering gimbal lock
        // this.quaternion.multiply(this.bendingQuaternionDelta);
        this.bendingIncrements--;
    }

    // interpolate implementation
    interpolate(nextObj, percent, worldSettings) {

        // get the incremental delta position
        // const positionDelta = (new ThreeVector())
        //     .copy(nextObj.position)
        //     .subtract(this.position)
        //     .multiplyScalar(playPercentage);
        // this.position.add(positionDelta);

        // slerp to target position
        this.position.lerp(nextObj.position, percent);
        //this.quaternion.slerp(nextObj.quaternion, percent);
    }
}