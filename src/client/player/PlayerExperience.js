import * as soundworks from 'soundworks/client';
import PlayerRenderer from './PlayerRenderer';

const audioContext = soundworks.audioContext;
const audio = soundworks.audio;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle">
      <p>audio-stream-manager</p>
    </div>
    <div class="section-center">
      <input id="seek" type="range" min="-1" max="10" step="0.01" value="0" />
      <button class="btn" id="start">Start</button>
      <button class="btn" id="stop">Stop</button>
    </div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

const model = { title: `ok` };


class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });

    this.audioStreamManager = this.require('audio-stream-manager');
    this.audioScheduler = this.require('audio-scheduler');
    this.syncScheduler = this.require('sync-scheduler');
  }

  start() {
    super.start();
    console.log(this.id);
    let stream = null;

    stream = this.audioStreamManager.getStreamEngine('stream-0');
    stream.connect(audioContext.destination);
    const playControl = new audio.PlayControl(stream);

    this.view = new soundworks.CanvasView(template, model, {
      'click #start': () => playControl.start(),
      'click #stop': () => playControl.stop(),
      'input #seek': e => {
        playControl.seek(parseFloat(e.target.value));
      },
    }, {
      id: this.id,
      preservePixelRatio: true,
    });

    this.show().then(() => {
      this.view.$el.querySelector('#seek').setAttribute('max', stream.duration);
    });
  }
}

export default PlayerExperience;
