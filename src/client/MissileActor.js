'use strict';

export default class ShipActor {

    constructor(renderer){
        this.gameEngine = renderer.gameEngine;

        let scene = renderer.getScene();//get current index scenes
        this.sprite = scene.add.sprite(10, 10, 'shot');
        // keep a reference to the actor from the sprite
        this.sprite.actor = this; //this used for renderer list array from sprites list update loop
        //console.log(this.sprite);
    }

    renderStep(delta){
        if(this.sprite){

        }
    }

    destroy() {
        return new Promise((resolve) =>{
            //console.log("delete sprite!");
            if (this.sprite) this.sprite.destroy();
            this.sprite = null;
            //delay to be remove from scene
            setTimeout(()=>{
                //console.log("delay delete sprite!");
                resolve();
            }, 300);
            
        });
    }
}