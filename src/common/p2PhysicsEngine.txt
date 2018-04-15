import PhysicsEngine from 'lance/physics/PhysicsEngine';
//import 'phaser/src/physics/impact/index';
//import PhaserArcade from './PhaserArcade';
//console.log(this);
//console.log(PhaserArcade);

import p2 from 'p2';

export default class p2PhysicsEngine extends PhysicsEngine {
    constructor(options) {
        super(options);

        this.options.dt = this.options.dt || (1 / 60);

        let world = this.world = new p2.World({
            //gravity:[0, -9.82]
        });

        console.log("p2 Physics");
        this.fixedTimeStep = 1 / 60; // seconds
        this.maxSubSteps = 10; // Max sub steps to catch up with the wall clock
        this.lastTime;
    }

    // entry point for a single step of the Simple Physics
    step(dt, objectFilter) {
        //this.world.step(dt || this.options.dt);
        // Compute elapsed time since last render frame
        var deltaTime = this.lastTime ? (dt - this.lastTime) / 1000 : 0;

        this.world.step(this.fixedTimeStep, deltaTime, this.maxSubSteps);

        this.lastTime = dt;
        //console.log("step!");
    }
}