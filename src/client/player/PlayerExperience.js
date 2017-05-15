import * as soundworks from 'soundworks/client';

import AudioTagStream from './AudioTagStream';
import AudioNodeStream from './AudioNodeStream';

const audioContext = soundworks.audioContext;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-center">
      <p class="big"> streaming audio... </p>
    </div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

/*
* Soundworks experiment illustrating different methods for straming audio to the 
* web audio API. see AudioTagStream and AudioNodeStream files for details.
*/

// test streaming
class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.sync = this.require('sync');

    // init audio tag stream
    this.tagStream = new AudioTagStream(this, 'audio-tag-0');
    // this.tagStream2 = new AudioTagStream(this, 'audio-tag-1');

    // init audio node stream
    this.audioNodeStreamBufferInfos = new Map();
  }

  start() {
    super.start();

    // initialize the view
    this.view = new soundworks.CanvasView(template, {}, {}, {
      id: this.id,
      preservePixelRatio: true,
    });

    // callback: receive stream info
    this.receive('stream:infos', ( bufferInfos ) => {
      // shape buffer infos
      bufferInfos.forEach( (item) => {
        // get file name (assume at least 1 chunk in item)
        let fileName = item[0].name.split("/").pop();
        fileName = fileName.substr(fileName.indexOf("-")+1, fileName.lastIndexOf(".")-2);
        // save in locals
        this.audioNodeStreamBufferInfos.set(fileName, item);
      });
      this.startAudioNodeStream();
    });

    this.startAudioTagStream();

    // as show can be async, we make sure that the view is actually rendered
    this.show().then(() => {});
  }

  // init and start audio node stream object when received streamable files information
  startAudioNodeStream(){
    this.nodeStream = new AudioNodeStream(this, this.audioNodeStreamBufferInfos);
    this.nodeStream.connect(audioContext.destination);
    this.nodeStream.url = 'inside-out-bundle-of-joy-cut';
    this.nodeStream.loop = true;
    this.nodeStream.sync = false;
    this.nodeStream.start(0);    
  }

  startAudioTagStream(){
    // init audio tag streamer
    this.tagStream.init();
    this.tagStream.connect(audioContext.destination);
    this.tagStream.url = 'stream/misconceptions-about-global-warming-cut.wav';
    this.tagStream.sync = true;
    this.tagStream.loop = true;    
    this.tagStream.play();
  }

}

export default PlayerExperience;
