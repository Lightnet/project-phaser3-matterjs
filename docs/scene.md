# Scene:

# Notes:
 * Work in progress.

# Information:
 Scenes and objects will have to be manage in some way since objects need to be sync with client and server. Lancegg is helper to reduce time debug by using their gameObject class. Just think of as their components like Phaser 3.x.x build in modules way design as open end design.

# Setup:
 The most important for scene to be setup right is to have default scene to call finish loading the scene so the connect would not send game object sync when scene start to render objects.

```
export default class MyRenderer extends Renderer {

    init() {
        if (this.initPromise) return this.initPromise;

        //..    
        this.initPromise = new Promise((resolve, reject)=>{
            let onLoadComplete = () => {
                //this.isReady = true;
                resolve();
                //console.log("finished loading...");
            };

            //This will help load texture correctly with in initPromise 
            this.config.scene.create = function() {
                let render = MyRenderer.getInstance();
                render.gameEngine.emit('scenebootready');//trigger setup and ui assign listener.
                onLoadComplete();
            }
            //start scene
            this.game = new Phaser.Game(this.config);
        });

        return this.initPromise;
    }
}
```
This is how to load correct after testing which works. It will make sure the load is complete and image files is loaded right. Else it will draw poylgon green square.