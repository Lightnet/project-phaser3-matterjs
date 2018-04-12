'use strict';

export default class ShipActor {

    constructor(renderer){
        this.gameEngine = renderer.gameEngine;

        let scene = renderer.getScene();//get current index scenes
        this.sprite = scene.add.sprite(10, 10, 'ship');
        // keep a reference to the actor from the sprite
        this.sprite.actor = this; //this used for renderer list array from sprites list update loop
        //console.log(this.sprite);
        this.addThrustEmitter();
    }

    addThrustEmitter(){
        //console.log("==============================================");
        this.thrustparticles = this.gameEngine.renderer.scene.add.particles('red');
        this.thrustEmitter = this.thrustparticles.createEmitter({
            //blendMode: 'SCREEN'
            scale: { start: 0.05, end: 0 },
            speed: { min: 200, max: 400 },
            on: false
        });
        this.thrustEmitter.setBlendMode(Phaser.BlendModes.ADD);
        this.thrustEmitter.emit = false;

        //console.log(this.thrustEmitter);
        this.explosionparticles = this.gameEngine.renderer.scene.add.particles('smokeparticle');
        this.explosionEmitter = this.explosionparticles.createEmitter({
            //blendMode: 'SCREEN',
            //active: false,
            //scale: { start: 0.05, end: 0 },
            on: false
        });
        this.explosionEmitter.setBlendMode(Phaser.BlendModes.ADD);
        this.explosionEmitter.emit = false;

    }

    renderStep(delta){
        if(this.sprite){
            if(this.nameText){
                this.nameText.x = this.sprite.x;
                this.nameText.y = this.sprite.y - 40;
            }
            
            if (this.thrustEmitter) {
                if (this.thrustEmitter.emit){
                    this.thrustEmitter.setAngle(this.sprite.rotation * 180 / Math.PI + 180 + 1)
                    this.thrustEmitter.explode();
                }
                this.thrustEmitter.setPosition(this.sprite.x, this.sprite.y);
            }

            if(this.explosionEmitter){
                this.explosionEmitter.setPosition(this.sprite.x, this.sprite.y);
            }

        }
    }

    changeName(name){//this will trigger from socket update list score
        if (this.nameText != null){
            this.nameText.destroy();
        }
        let scene = this.gameEngine.renderer.getScene()
        this.nameText = scene.add.text(0,0,name,{font:"18px Impact",fill: "#ffffff",align: 'center', boundsAlignH: 'center', boundsAlignV: 'middle'});
        //console.log(this.nameText);
    }

    destroy() {
        return new Promise((resolve) =>{
            //console.log("delete ship sprite!");
            if (this.sprite) this.sprite.destroy();
            if (this.nameText) this.nameText.destroy();
            this.explosionEmitter.explode();
            this.sprite = null;
            
            //delay to be remove from scene
            setTimeout(()=>{
                if (this.thrustparticles) this.thrustparticles.destroy();
                if (this.explosionparticles) this.explosionparticles.destroy();
                this.explosionEmitter.killAll();

                this.thrustparticles = null;
                this.explosionparticles = null;
                this.thrustEmitter = null;
                this.explosionEmitter = null;
                //console.log("delay delete ship sprite!");
                resolve();
            }, 300);
            
        });
    }
}