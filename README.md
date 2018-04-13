# Project-Phaser3-Matterjs

Created by: Lightnet

License: MIT

# Required:
 * Nodejs
 * Gulp (npm / auto build scripts)

# Information:
 Prototype development build for browser client and server physics nodejs. Phaser 3.x.x 2D render and Matter-js Physics 2D is being used to build this project to run client and server side with nodejs. It used Lance-gg client and server for mutliplayer management.

 Project is base on lance-gg github spaace game mutliplayer.

 [Spaace](https://github.com/lance-gg/spaaace) Pixi.js > Phaser 3.4.0 Frameworks.

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
Lance-gg Client | Lance-gg Engine  | Lance-gg Server
Phaser 3.x.x | Phaser 3.x.x | None
Matter.js | Matter.js | None

There are three important scripts. Client engine, game engine, and server engine. You can read in [lance-gg](http://lance.gg/) site for more explain. Game Engine script can act between client engine and server engine script to handle commmon share libraries like player position. Reason is build upon socket.io that share functions on both side is to sync to client and server to matches lerp network for players. 

Common folder files is used to check if the client has renderer variable is assign or not. As for server renderer it doesn't exist but it will sync variable and physics object if setup right. Server engine handle player connect side but required more setup like match making.


# Notes:
 * When matter.js 0.14.1 render is over lay Phaser 3.4.0 render the keyboard does not work. Click on again to get the keybaord to work.

# Credits:
 * [Spaace](https://github.com/lance-gg/spaaace)
 * [Lance-gg](http://lance.gg/)
 * [Matter.js](http://brm.io/matter-js/)
 * [Phaser 3.x.x](https://phaser.io/)
 * [html5gamedevs Phaser 3 forum](http://www.html5gamedevs.com/forum/33-phaser-3/)
 * [pixijs](http://www.pixijs.com/)