/*
 Information: Entry point where game engine and render are setup for game build and connection setup.
*/

//import '../../assets/sass/main.scss';

import querystring from 'query-string';
import MyClientEngine from '../client/MyClientEngine';
import MyGameEngine from '../common/MyGameEngine';

//import PhaserPhysicsEngine from '../common/PhaserPhysicsEngine';
//import p2PhysicsEngine from '../common/p2PhysicsEngine';
import matterPhysicsEngine from '../common/matterPhysicsEngine';
const qsOptions = querystring.parse(location.search);

// default options, overwritten by query-string options
// is sent to both game engine and client engine
const defaults = {
    traceLevel: 1,
    delayInputCount: 3,
    scheduler: 'render-schedule',
    syncOptions: {
        sync: qsOptions.sync || 'extrapolate',
        localObjBending: 0.0,
        remoteObjBending: 0.8,
        bendingIncrements: 6
    },
    //custom settings
    bphysicsdebug:true
    //bphysicsdebug:false
};
let options = Object.assign(defaults, qsOptions);

// create a client engine and a game engine
const gameEngine = new MyGameEngine(options);
const clientEngine = new MyClientEngine(gameEngine, options);
//var bphysicsdebug = true;
//listen document load event to start game renderer and connection.
document.addEventListener('DOMContentLoaded', function(e){
    clientEngine.start();
    //let physics = new PhaserPhysicsEngine({gameEngine:gameEngine});
    //let physics = new p2PhysicsEngine({gameEngine:gameEngine});
    //physics.step(0,null);
    //let physics = new matterPhysicsEngine({gameEngine:gameEngine});
    //physics.step(0,null);
    //console.log(physics);

    //console.log(document);
    /*
    if (bphysicsdebug){
        //console.log(document);
        var render = gameEngine.physicsEngine.Render.create({
            element: document.getElementById("matter-app"),
            engine: gameEngine.physicsEngine.engine,
            options: {
                //width: window.innerWidth,
                //height: window.innerHeight,
                //wireframes: false, // <-- important
                wireframeBackground:'transparent',
                background:'transparent'
            }
        });
        gameEngine.physicsEngine.Render.run(render);
    }
    */
    /*
    document.addEventListener('keydown', function(event) {
        if(event.keyCode == 37) {
            //alert('Left was pressed');
            console.log('Left was pressed');
        }
        else if(event.keyCode == 39) {
            //alert('Right was pressed');
            console.log('Right was pressed');
        }
    });
    */
});

function JoinTest(){
    gameEngine.emit('join');
}
window.JoinTest =JoinTest;

