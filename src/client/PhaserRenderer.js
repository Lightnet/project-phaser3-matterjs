/*
    Information: Default build for Phaser Renderer Class
*/

//import isNode from 'detect-node'
//if (!isNode) {                                                                                                                                                                                        
    //require('phaser');
    //var Renderer = require('phaser/dist/phaser');
//}

import Renderer from 'lance/render/Renderer';
/**
 * Phaser Renderer
 */

export default class PhaserRenderer extends Renderer {

    //get ASSETPATHS() {
        //return {};
    //}

    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        this.sprites = {};
        this.config = {};
        this.game = null;
        this.isReady = false;
    }

    //start(){
        //this.game = new Phaser.Game(this.config);
    //}

    init() {
        let p = super.init();
        /*
        //ignore since it could override config. This is test.
        this.config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            scene: {
                preload: this.preload,
                create: this.create,
                update: this.update
            }
        };
        */
        
        return p; // eslint-disable-line new-cap
    }

    draw(t, dt) {
        super.draw(t, dt);
    }

    //tick(t, dt) {
        //super.draw(t, dt);
    //}

    //addObject(obj) {
        //super.addObject(obj);
    //}

    //removeObject(obj) {
        //super.removeObject(obj);
    //}
}