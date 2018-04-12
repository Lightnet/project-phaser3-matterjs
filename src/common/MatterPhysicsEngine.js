import PhysicsEngine from 'lance/physics/PhysicsEngine';

//https://github.com/liabru/matter-js/issues/101
//var Matter = require('matter-js/build/matter.js');
import Matter from 'matter-js';

export default class MatterPhysicsEngine extends PhysicsEngine {
    constructor(options) {
        super(options);

        console.log("matter Physics");

        this.options.dt = this.options.dt || (1 / 60);
        //https://github.com/liabru/matter-js/wiki/Getting-started

        this.Engine = Matter.Engine;
        this.Render = Matter.Render;
        this.World = Matter.World;
        this.Bodies = Matter.Bodies;
        this.Composite = Matter.Composite;
        this.Events = Matter.Events;
        // create an engine
        this.engine = this.Engine.create();
        //console.log("gravity y:",this.engine.world.gravity.y);
        //this.engine.world.gravity.y = 9;
        //this.engine.world.gravity.scale = 0.01;
        console.log("Gravity: ",this.engine.world.gravity);

        var ground = this.Bodies.rectangle(400, 610, 800, 60,{ isStatic: true });
        this.World.add(this.engine.world, ground);
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

        if (o.isRotatingRight) { o.angle += o.rotationSpeed; }
        if (o.isRotatingLeft) { o.angle -= o.rotationSpeed; }
        //console.log(o.isRotatingRight);

        if (o.angle >= 360) { o.angle -= 360; }
        if (o.angle < 0) { o.angle += 360; }

        //====

        o.isAccelerating = false;
        o.isRotatingLeft = false;
        o.isRotatingRight = false;

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