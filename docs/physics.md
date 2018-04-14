# Physics:

# Notes:
 * [Phaser](https://phaser.io/) 3.x.x Physics will not work with client and server object syncs with [lancegg](http://lance.gg/)

# Information: 
 2D Physics that being used is [Matter.js](http://brm.io/matter-js/) which used for client and server side. This project chose to used Matter.js since Phaser 3.x.x has matter.js build in their framework. The nodejs server run on headless to able to run 2D physics but does not work with Phaser 3 2D Physics built into their framework. Reason is simple that object sync to send and receive data using lancegg. Browser window and docment varaible does not exist in nodejs server since it not broser but pure javascript.



 