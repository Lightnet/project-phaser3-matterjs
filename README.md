# Project-Phaser3-Matterjs

Created by: Lightnet

License: MIT

Status: Work in progress.

# Required:
 * Nodejs
 * Gulp (npm / Auto build scripts)
 * Visual Studio Code ( Optional )

# Information:
 Prototype development build for browser client and server 2D physics nodejs. Phaser 3.x.x 2D render and Matter-js Physics 2D is being used to build this project to run client and server side with nodejs. It used Lance-gg client and server for mutliplayer to sync objects.

 Project is base on lance-gg github spaace game mutliplayer.

 [Spaaace](https://github.com/lance-gg/spaaace) Pixi.js > Phaser 3.x Frameworks.

# Controls:
 * B = Deploy Object Test.
 * C = Brake or stop ship movement.
 * Space = Shoot
 * Up key = Forward
 * Left and Right Key = Rotate

# Layout:
```
 Dev folder:
  - assets (files)
  - dist (server files)
  - node_moduels (npm)
  - public (web host / static)
  - src (client and server)
  - main.js (server app)
  - .babel (compile es6 to javascript)
  - gulpfile.js (auto build script tasks)
  - index.html (default page)
```

# Client and Server Engine:

Client | Common | Server
-------|--------|-------
Lance-gg Client (socket.io) | Lance-gg Engine (Management / GameObject)  | Lance-gg Server (socket.io)
Phaser 3.x.x | Phaser 3.x.x | None
Matter.js | Matter.js | None

There are three important scripts. Client engine, game engine, and server engine. As well entry point for client and server node. You can read in [lance-gg](http://lance.gg/) site for more explaining. Game Engine script can act between client engine and server engine script to handle common share libraries like gameObject or player position. By using Lancegg node package to sync gameObject to socket.io that share functions on both side is to sync correct data object.

Common or share libaray folder files is used for serializer gameObject to handle game engine network.

# Example:
 * Babel Javscript.
 * Common/Ship.js (Note: Testing...)
```
import DynamicObject from 'lance/serialize/DynamicObject';
import Renderer from '../client/MyRenderer';

export default class Ship extends DynamicObject {
  constructor(gameEngine, options, props){
    super(gameEngine, options, props);
    this.showThrust = 0;
    this.isBot = false;
    this.angle = 0;
  }

  onAddToWorld(gameEngine) {// this will handle client and server add to gameEngine for sync
    //setup 2D physics for client and server side.
    this.physicsObj = gameEngine.physicsEngine.addCircle(this.position.x,this.position.y,{});
    this.physicsObj.gameObject = this;

    let renderer = Renderer.getInstance();
    //check if client browser or server node if Phaser 3 has render setup.
    if (renderer) {//if client renderer then setup.
      let shipActor = new ShipActor(renderer);
      let sprite = shipActor.sprite;
      renderer.sprites[this.id] = sprite;
      sprite.id = this.id;

      if (gameEngine.isOwnedByPlayer(this)) {
        renderer.addPlayerShip(sprite);
      } else {
        renderer.addOffscreenIndicator(this);
      }
    }
  }

  onRemoveFromWorld(gameEngine) {
    let renderer = Renderer.getInstance();
    if (renderer) {//check if render client exist
      if (gameEngine.isOwnedByPlayer(this)) {
        renderer.playerShip = null;
      } else {
        renderer.removeOffscreenIndicator(this);
      }
      let sprite = renderer.sprites[this.id];
      if (sprite) {
        if (sprite.actor) {
          // removal "takes time"
          sprite.actor.destroy().then(()=>{
            //console.log('deleted sprite actor');
            delete renderer.sprites[this.id];
          });
        } else {
          //console.log('deleted sprite');
          sprite.destroy();
          delete renderer.sprites[this.id];
        }
      }
    }
    //remove physics object from gameEngine.physicsEngine
    if(this.physicsObj){
      this.gameEngine.physicsEngine.removeObject(this.physicsObj);
    }
  }
}

```

# Notes:
 * When matter.js 0.1x.x render is over lay Phaser 3.x.x render the keyboard does not work. Click on again to get the keybaord to work.
 * Matter.js 2D physics handler is under testing.

# Credits:
 * [Spaace](https://github.com/lance-gg/spaaace) Github
 * [Lance-gg](http://lance.gg/) Site
 * [Matter.js](http://brm.io/matter-js/) Site
 * [Phaser 3.x.x](https://phaser.io/) Site
 * [Html 5 Game Devs Phaser 3 Forum](http://www.html5gamedevs.com/forum/33-phaser-3/) Forum
 * [Pixijs](http://www.pixijs.com/) Site