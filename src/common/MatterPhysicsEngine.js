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

        console.log("matter Physics");

        this.options.dt = this.options.dt || (1 / 60);
        //https://github.com/liabru/matter-js/wiki/Getting-started

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
        console.log("Gravity: ",this.engine.world.gravity);

        var ground = this.Bodies.rectangle(400, 610, 800, 60,{ isStatic: true });
        this.World.add(this.engine.world, ground);

        /*
        //console.log(document);
        if (document !=null){
            console.log(document);

            var render = this.Render.create({
                element: document.body,
                engine: engine,
                options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false // <-- important
                }
            });

            Render.run(render);
        }
        */
    }

    addBox(x, y, options) {
        //let box = this.Bodies.rectangle(x, y, 40, 40);
        var box = this.Bodies.rectangle(400, 200, 80, 80);
        this.World.add(this.engine.world, box);
        return box;
    }

    addCircle(x, y, options) {
        var box = this.Bodies.rectangle(x, y, 40, 40);
        this.World.add(this.engine.world, box);
        return box;
    }

    addGround(x, y, options) {
        var ground = this.Bodies.rectangle(400, 610, 800, 60,{ isStatic: true });
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

        if (o.angle >= 360) { o.angle -= 360; }
        if (o.angle < 0) { o.angle += 360; }

        if (o.isAccelerating) {
            let rad = o.physicsObj.angle;
            dv.set(Math.cos(rad), Math.sin(rad)).multiplyScalar(o.acceleration).multiplyScalar(dt);
            o.velocity.add(dv);
            let velMagnitude = o.velocity.length();
            if ((o.maxSpeed !== null) && (velMagnitude > o.maxSpeed)) {
                o.velocity.multiplyScalar(o.maxSpeed / velMagnitude);
            }
            this.Body.setVelocity( o.physicsObj, {x: o.velocity.x, y: o.velocity.y});
        }
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

    // entry point for a single step of the Simple Physics
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