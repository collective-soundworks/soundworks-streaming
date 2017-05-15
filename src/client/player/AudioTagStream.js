import * as soundworks from 'soundworks/client';

const audioContext = soundworks.audioContext;

/*
* The AudioTagStream class illustrates how to stream audio file to the web audio API based on 
* the createMediaElementSource method applied to an HMTL audio tag. While perfectly functional 
* for casual streaming, this approach has several drawbacks (05/2017):
* - audio tag not designed for precise timing, hard to synchronize audio streams amongst clients
* - media element source in WebKit will behave as if directly linked to the audioContext.destination, 
*   regardless of the audio graph one designs (i.e. can't apply gain, analyzer, etc.).
*/

export default class AudioTagStream {

    /* 
    * featureId is a string, used to identify the audio-tag feature definition wrt the platform service.
    * simply make sure that two different audioTagStream instances do not share the same featureId.
    */
    constructor(experience, featureId) {
        
        // options
        this.e = experience;

        // locals
        this._sync = false;
        this._syncCallbackHandle = undefined;
        this._syncRefreshRate = 4000; // sync callback refresh rate, in ms

        // bind
        this.syncCallback = this.syncCallback.bind(this);

        // define audio tag platform feature
        this.platformFeature = {
          id: featureId,
          check: function() { return true; },
          interactionHook: () => {
            
            

            // create audio tag and start it to avoid requiring user input to start them latter
            this.audioTag = new Audio();
            this.audioTag.play();      
            // audioElmt.play = () => { audioElmt.pause(); audioElmt.play = undefined; };
            return Promise.resolve(true);
          }
        }

        // add audio tag feature to platform, activating them with platform click
        this.e.platform.addFeatureDefinition( this.platformFeature );
        this.e.platform = this.e.require('platform', { features: ['web-audio', featureId] });

        // add warning about audio gain
        console.warn('in Webkit (iOS) pluging a media element source to any node of the web audio API (audio gain, filter, analyzer, etc.) will bypass them');      
    }

    init(){
      // mute audioTag for safari: else the overwrite of audioTag output by the createMediaElmt does not 
      // happend fast enought and one can hear the volume 1.0 at startup. Note: Safari will automatically 
      // bypass the mute when using the createMediaElmt, Chrome won't.
      // if(soundworks.client.platform.os === 'ios'){ this.audioTag.muted = true; }
      // create source (can be created only once)
      this.src = audioContext.createMediaElementSource( this.audioTag );
      // if( !client.platform.isMobile ){ return; }
    }

    connect(audioNode){
      this.src.connect(audioNode);
    }

    set url(filePath){ this.audioTag.src = filePath; }

    get url(){ return this.audioTag.src; }

    set loop(val){ this.audioTag.loop = val; }

    get loop(){ return this.audioTag.loop; }
    
    set sync(val){
      if( val ){ console.warn('expect zipper noise with sync.')}
      this._sync = val; 
    }

    get sync(){ return this._sync; }

    play(){ 
      if( this._sync ){
        // call sync callback now to sync start time in buffer
        this.syncCallback();
        // setup callback interval
        this._syncCallbackHandle = setInterval(this.syncCallback, this._syncRefreshRate);
      }
      this.audioTag.play();
    }

    pause(){ 
      if( this._syncCallbackHandle !== undefined ){
        clearInterval( this._syncCallbackHandle );
        this._syncCallbackHandle = undefined;
      }
      this.audioTag.pause(); 
    }

    stop(){
      this.pause();
      // reset play position
      this.audioTag.currentTime = 0.0;
    }    

    syncCallback(){
      // skip at startup, when audiotag duration not yet defined
      if( isNaN( this.audioTag.duration) ){ return; }
      // get current sync time
      let time = this.e.sync.getSyncTime() % this.audioTag.duration;
      // set audio tag time
      this.audioTag.currentTime = time;
    }

}