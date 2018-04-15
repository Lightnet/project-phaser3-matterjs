import PhysicsEngine from 'lance/physics/PhysicsEngine';
import TwoVector from 'lance/serialize/TwoVector';

//https://github.com/liabru/matter-js/issues/101
//var Matter = require('matter-js/build/matter.js');
import Matter from 'matter-js';


let dv = new TwoVector();
let dx = new TwoVector();

export default class MatterPhysicsEngine extends PhysicsEngine {
    constructor(options) {
        super(options);
        //console.log("matter Physics");
        this.options.dt = this.options.dt || (1 / 60);
        //https://github.com/liabru/matter-js/wiki/Getting-started

        this.defaultCategory = 0x0001;
        this.playerCategory = 0x0002;
        this.projectileCategory = 0x0004;
        this.enemyCategory = 0x0008;

        this.Vector = Matter.Vector;
        this.Bounds = Matter.Bounds;

        this.Engine = Matter.Engine;
        this.Render = Matter.Render;
        this.World = Matter.World;
        this.Body = Matter.Body;
        this.Bodies = Matter.Bodies;
        this.Composite = Matter.Composite;
        this.Events = Matter.Events;
        // create an engine
        this.engine = this.Engine.create();
        //console.log("gravity y:",this.engine.world.gravity.y);
        this.engine.world.gravity.y = 0;
        //this.engine.world.gravity.scale = 0.01;
        //console.log("Gravity: ",this.engine.world.gravity);
        
        //var ground = this.Bodies.rectangle(400, 610, 800, 60,{ isStatic: true });
        //this.World.add(this.engine.world, ground);
        //console.log("this");
        //console.log(this);
        //this.setupMatterEvents();
    }

    setupMatterEvents(){
        //2D collision events
        /*
        this.Events.on(this.engine, 'collisionStart', (event)=> {
            var pairs = event.pairs;
            // change object colours to show those starting a collision
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                //pair.bodyA.render.fillStyle = '#333';
                //pair.bodyB.render.fillStyle = '#333';
                console.log("collisionStart");
                let o1 = pair.bodyA.gameObject;
                let o2 = pair.bodyB.gameObject;
                // make sure that objects actually exist. might have been destroyed
                if (!o1 || !o2) return;
                this.gameEngine.emit('collisionStart', { o1, o2 });
            }
        });
        */

        this.Events.on(this.engine, 'collisionStart', (event)=> {
            this.collisionStart(event);
        });

        this.Events.on(this.engine, 'collisionActive', (event)=> {
            this.collisionActive(event);
        });

        this.Events.on(this.engine, 'collisionEnd', (event)=> {
            this.collisionEnd(event);
        });

        this.Events.on(this.engine, 'beforeUpdate', (event)=> {
            this.beforeUpdate(event);
        });
    }

    collisionStart(event){
        var pairs = event.pairs;
        // change object colours to show those starting a collision
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            //pair.bodyA.render.fillStyle = '#333';
            //pair.bodyB.render.fillStyle = '#333';
            //console.log("collisionStart");
            let o1 = pair.bodyA.gameObject;
            let o2 = pair.bodyB.gameObject;
            // make sure that objects actually exist. might have been destroyed
            if (!o1 || !o2) return;
            this.gameEngine.emit('collisionStart', { o1, o2 });
        }
    }

    collisionActive(event){
        var pairs = event.pairs;

        // change object colours to show those in an active collision (e.g. resting contact)
        //for (var i = 0; i < pairs.length; i++) {
            //var pair = pairs[i];
            //pair.bodyA.render.fillStyle = '#333';
            //pair.bodyB.render.fillStyle = '#333';
            //console.log(pair.bodyA);
            //console.log(pair.bodyB);
            //console.log("collisionActive");
            //if(pair.bodyA.gameObject){
                //console.log("collisionActive found gameObject!");
            //}
        //}
    }

    collisionEnd(event){
        var pairs = event.pairs;
        // change object colours to show those ending a collision
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            //pair.bodyA.render.fillStyle = '#222';
            //pair.bodyB.render.fillStyle = '#222';
            //console.log("collisionEnd");
            //if(pair.bodyA.gameObject){
                //console.log("collisionEnd found gameObject!");
            //}
        }
    }

    beforeUpdate(event){
        //var engine = event.source;
        //var bodies = Composite.allBodies(engine.world);
        //console.log(bodies);
        //console.log("update?");
        //for (var i = 0; i < bodies.length; i += 1) {
            //if(bodies[i].id == 1){
                //console.log(bodies[i].position);
            //}
        //}
        // apply random forces every 5 secs
        //if (event.timestamp % 5000 < 50)
            //shakeScene(engine);
    }

    addBox(x, y, options) {
        let width = options.width | 32;
        let height = options.height | 32;
        let params = options.params | {};
        //let box = this.Bodies.rectangle(x, y, 40, 40);
        var box = this.Bodies.rectangle(x, y, width, height, params);
        this.World.add(this.engine.world, box);
        return box;
    }

    addCircle(x, y, options) {
        let radius = options.radius | 20;
        let params = options.params | {};
        var circle = this.Bodies.circle(x, y, radius,{
            collisionFilter: {
                mask: this.defaultCategory | this.playerCategory
            }
        });
        this.World.add(this.engine.world, circle);
        return circle;
    }

    // https://github.com/liabru/matter-js/blob/master/examples/sensors.js
    addProjectile(x, y, options) {
        var circle = this.Bodies.circle(x, y, 20,{
            isSensor: true//,
            //collisionFilter: {
                //mask: this.projectileCategory
            //}
        });
        this.World.add(this.engine.world, circle);
        return circle;
    }

    addGround(x, y, options) {
        var ground = this.Bodies.rectangle(400, 610, 800, 60,{ 
            isSensor: true,
            isStatic: true 
        });
        this.World.add(this.engine.world, ground);
        return ground;
    }

    objectStep(o, dt) {

        // calculate factor
        if (dt === 0)
            return;

        if (dt)
            dt /= (1 / 60);
        else
            dt = 1;

        let worldSettings = this.gameEngine.worldSettings;
        // https://code.tutsplus.com/tutorials/getting-started-with-matterjs-body-module--cms-28835
        // http://cwestblog.com/2012/11/12/javascript-degree-and-radian-conversion/
        if (o.isRotatingRight) { 
            o.angle += o.rotationSpeed; 
            if(o.physicsObj){
                //console.log("isRotatingRight!",o.rotationSpeed);
                //o.physicsObj.angle += 0.01;
                //this.Body.rotate( o.physicsObj, Math.PI/6);
                let angle = o.rotationSpeed * Math.PI / 180;
                this.Body.rotate( o.physicsObj,angle);
                //console.log(o.physicsObj.angle);
            }
        }
        if (o.isRotatingLeft) { 
            o.angle -= o.rotationSpeed; 
            if(o.physicsObj){
                //console.log("found!");
                //o.physicsObj.angle -= 0.01; 
                let angle = o.rotationSpeed * Math.PI / 180;
                this.Body.rotate( o.physicsObj, angle*-1);
                //console.log(o.physicsObj.angle);
            }
        }
        //console.log(o.isRotatingRight);

        //if (o.angle >= 360) { o.angle -= 360; }
        //if (o.angle < 0) { o.angle += 360; }

        /*
        if (o.isAccelerating) {
            let rad = o.physicsObj.angle;
            dv.set(Math.cos(rad), Math.sin(rad)).multiplyScalar(o.acceleration).multiplyScalar(dt);
            o.velocity.add(dv);

            //dv.set(Math.cos(rad), Math.sin(rad)).multiplyScalar(o.acceleration);
            //o.velocity.x = 0;
            //o.velocity.y = 0.001;
            //o.velocity.add(dv);
            //o.velocity.x = o.velocity.x / 100;
            //o.velocity.y = o.velocity.y / 100;
            //dv.x = dv.x / 100;
            //dv.y = dv.y / 100;
            //dv.x = 0.001;
            //dv.y = 0.001;
            //if ((dv.x == null) || (dv.y == null))
                //return;

            //console.log(dv);
            //console.log(o.physicsObj.speed);
            //this.Body.applyForce(o.physicsObj, {x:o.physicsObj.x,y:o.physicsObj.y}, {x:dv.x, y:dv.y});
            this.Body.setVelocity( o.physicsObj, {x: o.velocity.x, y: o.velocity.y});
        }
        */
        /*
        let velMagnitude = o.velocity.length();
        if ((o.maxSpeed !== null) && (velMagnitude > o.maxSpeed)) {
            o.velocity.multiplyScalar(o.maxSpeed / velMagnitude);
        }
        */
        //console.log(Math.round(o.physicsObj.speed * 100));
        /*
        let speed = Math.round(o.physicsObj.speed * 100);
        if ((speed <= 5)&&(o.isAccelerating == false)){
            //this.Body.setVelocity( o.physicsObj, {x: 0, y: 0});
            //o.velocity.x = 0;
            //o.velocity.y = 0;
            //this.Body.setVelocity( o.physicsObj, {x: o.velocity.x, y: o.velocity.y});
        }
        */

        //this.Body.setVelocity( o.physicsObj, {x: o.velocity.x, y: o.velocity.y});
        
        /*
        if (o.isAccelerating) {
            let rad = o.angle * (Math.PI / 180);
            dv.set(Math.cos(rad), Math.sin(rad)).multiplyScalar(o.acceleration).multiplyScalar(dt);
            o.velocity.add(dv);
        }
        // apply gravity
        if (o.affectedByGravity) o.velocity.add(this.gravity);
        let velMagnitude = o.velocity.length();
        if ((o.maxSpeed !== null) && (velMagnitude > o.maxSpeed)) {
            o.velocity.multiplyScalar(o.maxSpeed / velMagnitude);
        }
        */
        //====

        o.isAccelerating = false;
        o.isRotatingLeft = false;
        o.isRotatingRight = false;

        /*
        dx.copy(o.velocity).multiplyScalar(dt);
        o.position.add(dx);
        o.velocity.multiply(o.friction);
        */

        // wrap around the world edges
        if (worldSettings.worldWrap) {
            if (o.position.x >= worldSettings.width) { o.position.x -= worldSettings.width; }
            if (o.position.y >= worldSettings.height) { o.position.y -= worldSettings.height; }
            if (o.position.x < 0) { o.position.x += worldSettings.width; }
            if (o.position.y < 0) { o.position.y += worldSettings.height; }
        }

    }

    // entry point for a single step of the Matter.js 2D Physics
    step(dt, objectFilter) {
        //console.log(dt);
        //console.log(objectFilter);
        //this.world.step(dt || this.options.dt);
        let delta = dt || this.options.dt;

        // each object should advance
        let objects = this.gameEngine.world.objects;
        for (let objId of Object.keys(objects)) {

            // shadow objects are not re-enacted
            let ob = objects[objId];
            if (!objectFilter(ob))
                continue;

            // run the object step
            this.objectStep(ob, dt);
        }

        //console.log(delta);
        //console.log("step!");
        //https://github.com/liabru/matter-js/wiki/Running
        //this.Engine.update(this.engine, dt || this.options.dt);
        //console.log(this.engine.timing.delta);
        //this.Engine.update(this.engine, delta);
        this.Engine.update(this.engine, this.engine.timing.delta);
    }

    removeObject(obj) {
        //this.world.removeBody(obj);
        this.World.remove(this.engine.world, obj);
    }
}