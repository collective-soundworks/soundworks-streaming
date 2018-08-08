import { Experience } from 'soundworks/server';

// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.sharedParams = this.require('shared-params');

    this.audioStreamManager = this.require('audio-stream-manager', {
      audioFiles: {
        'stream-0': 'sounds/streams/stream-0.wav',
      },
    });
    // this.audioScheduler = this.require('audio-scheduler');
    this.syncScheduler = this.require('sync-scheduler');
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
