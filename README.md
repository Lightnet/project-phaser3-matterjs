# Project-Phaser3-Matterjs

Created by: Lightnet

License: MIT

# Required:
 * Nodejs
 * Gulp (npm / auto build scripts)

# Information:
 Prototype development build for client and server physics nodejs. Phaser 3.4.0 render only build.

 Physics 2D that being used is matter.js that work on client and server nodejs.

 Project is base on lance-gg github spaace game mutliplayer.

 [spaace](https://github.com/lance-gg/spaaace) Pixi.js > Phaser 3.4.0 Frameworks.

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

Client | Common | Server
-------|--------|-------
Lance-gg Client | Lance-gg Engine  | Lance-gg Server
Phaser 3.x.x | Phaser 3.x.x | None
Matter.js | Matter.js | None

There are three important scripts. Client engine, game engine, and server engine. You can read in lance-gg site for more explain. Game Engine script can act between client engine and server engine script to handle commmon share libraries like player position. Reason is build upon socket.io that share functions on both side is to sync to client and server to matches lerp network for players. 

Common folder files is used to check if the client has renderer variable is assign or not. As for server renderer it doesn't exist but it will sync variable and physics object if setup right. Server engine handle player connect side but required more setup like match making.


# Notes:
 * When matter.js 0.14.1 render is over lay Phaser 3.4.0 render the keyboard does not work. Click on again to get the keybaord to work.