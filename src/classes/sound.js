import {jsfxr} from './jsfxr';

let audiopool = [];
// let pannerNodes = [];

// change this so the audio context gets (loaded if not already) 
// when the game actually starts.
let audioContext;

export function InitAudio() {
    //     if (audioContext) return;
    audioContext = new AudioContext();
 //   audioContext.listener.upX.value = 0;
    //audioContext.listener.upY.value = 1;
  //  audioContext.listener.upZ.value = 0;
    //audioContext.sampleRate = 11025;

    let gain = audioContext.createGain();
    gain.connect(audioContext.destination);

    for (let i = 0; i < 25; i++) {
        const audio = new Audio();
        audiopool.push(audio);
        const element = audioContext.createMediaElementSource(audio);
        // const pn = new PannerNode(audioContext, {
        //     // panningModel: 'HRTF',
        //     // distanceModel: 'exponential',
        // });

        element.connect(gain);
        // pn.connect(gain);
        // pannerNodes.push(pn);
    }
}
let currentSfxIndex = 0;
export const soundfx = {
jump : jsfxr([0,,0.39,,0.2236,0.18,,0.26,-0.16,0.4,0.44,,,0.0894,,,,,1,,,,,1]),
orb: jsfxr([0,,0.01,0.4202,0.4783,0.5161,,,,,,0.5253,0.5852,,,,,,1,,,,,1]),
checkpoint: jsfxr([1,,0.2352,,0.4798,0.436,,0.2272,,,,,,,,0.583,,,1,,,,,1]),
gameover: jsfxr([0,0.12,0.71,0.16,0.27,0.54,0.08,-0.16,0.02,0.68,0.44,,,0.3429,,,0.4599,-0.3199,1,,0.44,0.77,-0.14,1]),
land: jsfxr([1,,0.32,0.0537,0.11,0.39,,-0.4599,,-0.4127,-0.7825,-0.2391,0.3325,0.1007,0.3758,,-0.4424,0.0572,0.7585,,0.5766,0.0059,-0.0001,0.43]),

};


export const sound = {
    play: function (params, p) {
        // let pos=p.getWorldPosition(zeroVector);
        // pannerNodes[currentSfxIndex].positionX.value = pos.x;
        // pannerNodes[currentSfxIndex].positionY.value = pos.y;
        // pannerNodes[currentSfxIndex].positionZ.value = pos.z;

        audiopool[currentSfxIndex].src = params;//soundfx[params];
        audiopool[currentSfxIndex].play();
        currentSfxIndex = (currentSfxIndex + 1) % 25;
    },
  /*  
    fire: 0,
    explosion: 1,
    gameover: 2,
    select: 3,
    spawn: 4,
    upgrade: 5,
    place: 6
    */
};
