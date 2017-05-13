import * as soundworks from 'soundworks/client';

import AudioTagStream from './AudioTagStream';

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

// test streaming
class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.sync = this.require('sync');
    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain,
      directories: { path: 'sounds', recursive: true },
    });

    this.tagStream = new AudioTagStream(this, 'audio-tag-0');
    this.tagStream2 = new AudioTagStream(this, 'audio-tag-1');
  }

  start() {
    super.start();

    // initialize the view
    this.view = new soundworks.CanvasView(template, {}, {}, {
      id: this.id,
      preservePixelRatio: true,
    });

    // init audio tag streamer
    this.tagStream.init();
    this.tagStream.connect(audioContext.destination);
    this.tagStream.url = 'stream/misconceptions-about-global-warming-cut.wav';
    this.tagStream.play();

    this.tagStream2.init();
    this.tagStream2.connect(audioContext.destination);
    this.tagStream2.url = 'stream/inside-out-bundle-of-joy-cut.wav';
    this.tagStream2.sync = true;
    this.tagStream2.loop = true;

    setTimeout( () => {
      this.tagStream2.play();
    }, 2000);
    setTimeout( () => {
      this.tagStream.stop();
    }, 4000);

    // as show can be async, we make sure that the view is actually rendered
    this.show().then(() => {
    });
  }

}

export default PlayerExperience;
