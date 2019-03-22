import * as soundworks from 'soundworks/client';
import * as controllers from '@ircam/basic-controllers';
import * as masters from 'waves-masters';

controllers.setTheme('dark');

const audioContext = soundworks.audioContext;
const audio = soundworks.audio;

const template = `
  <div>
    <h2 class="normal">audio-stream-manager</h2>
    <div id="controllers"></div>
  </div>
`;

class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });

    this.audioStreamManager = this.require('audio-stream-manager');
  }

  start() {
    super.start();

    this.view = new soundworks.View(template, {}, {}, { id: 'player' });

    const scheduler = new masters.Scheduler(() => audioContext.currentTime);
    const transport = new masters.Transport(scheduler);
    const playControl = new masters.PlayControl(scheduler, transport);

    this.show().then(() => {
      const $container = this.view.$el.querySelector('#controllers');

      const playStop = new controllers.TriggerButtons({
        label: 'transport',
        options: ['start', 'pause', 'stop'],
        default: 'stop',
        container: $container,
        callback: value => playControl[value](),
      });

      const streamIds = this.audioStreamManager.streamIds;
      let duration = 0;

      streamIds.forEach(id => {
        const stream = this.audioStreamManager.getStreamEngine(id);
        stream.connect(audioContext.destination);

        duration = Math.max(duration, stream.duration);

        const toggle = new controllers.Toggle({
          label: id,
          default: false,
          container: $container,
          callback: value => {
            if (value) {
              transport.add(stream);
            } else {
              transport.remove(stream);
            }
          }
        });
      });

      const seek = new controllers.Slider({
        label: 'seek',
        min: 0,
        max: duration,
        default: 0,
        step: 0.001,
        size: 'large',
        container: $container,
        callback: value => playControl.seek(value),
      });
    });
  }
}

export default PlayerExperience;
