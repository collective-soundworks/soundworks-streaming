import { Experience } from 'soundworks/server';

// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.sharedParams = this.require('shared-params');

    this.audioStreamManager = this.require('audio-stream-manager', {
      audioFiles: {
        'stream-0': 'sounds/streams/stream-0.wav',
        'stream-1': 'sounds/streams/stream-1.wav',
        'stream-2': 'sounds/streams/stream-2.wav',
        'stream-3': 'sounds/streams/stream-3.wav',
        'sine-0': 'sounds/streams/sine-0.wav',
        'sine-1': 'sounds/streams/sine-1.wav',
        'sine-2': 'sounds/streams/sine-2.wav',
        'sine-3': 'sounds/streams/sine-3.wav',
      },
      compress: true,
      chunkDuration: 6,
    });
  }

  start() {

  }

  enter(client) {
    super.enter(client);

    this.sharedParams.update('numPlayers', this.clients.length);
  }

  exit(client) {
    super.exit(client);

    this.sharedParams.update('numPlayers', this.clients.length);
  }
}
