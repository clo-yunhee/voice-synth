import _ from 'lodash'
import {db2amp} from '../gainConversion'

window.AudioContext = window.AudioContext || window.webkitAudioContext;

class VoiceSynth {

  static callbackDelay = 0.01;

  constructor() {
    this.loadPreset = this.loadPreset.bind(this);

    this.context = new AudioContext();

    this.sourceGain = this.context.createGain();
    this.prefiltGain = this.context.createGain();
    this.zeroFilter = this.context.createBiquadFilter();
    this.amp = this.context.createGain();

    this.zeroFilter.type = 'bandpass';
    this.zeroFilter.frequency.setValueAtTime(1, this.context.currentTime);
    this.zeroFilter.Q.setValueAtTime(1, this.context.currentTime);

    this.zeroFilter.disconnect();

    this.sourceGain.connect(this.prefiltGain);
    this.amp.connect(this.context.destination);

    this.volume = 1.0;
    this.playing = false;
    this.filterPass = true;

    this.formantF = [0, 0, 0, 0, 0];
    this._connectFilters();
  }

  loadModules() {
    return Promise.all([
      this.context.audioWorklet.addModule('worklets/sources.js'),
      this.context.audioWorklet.addModule('worklets/aspiration.js'),
    ]).then(this.createSourceNodes.bind(this));
  }

  start() {
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    this.sourceNode.connect(this.sourceAspiration);

    this.amp.gain.setValueAtTime(0, this.context.currentTime);
    this.amp.gain.linearRampToValueAtTime(this.volume, this.context.currentTime + 0.05);
    this.playing = true;
  }

  stop() {
    this.sourceNode.disconnect();

    this.playing = false;
    this.amp.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.05);
  }

  loadPreset(preset, callback, firstTime) {
    this.setSourceType(preset.source.name, firstTime);
    this.setSourceFrequency(preset.source.frequency, firstTime);
    this.setSourceParams(preset.source.params, firstTime);
    this.formantF = [...preset.formants.freqs];
    this.formantBw = [...preset.formants.bands];
    this.formantGain = [...preset.formants.gains];

    this.sourceGain.gain.value = 0.2;
    this.prefiltGain.gain.value = 5;
    this.amp.gain.value = this.volume;
    this._setFilters(true);

    if (this.playing) {
      this.start();
    }

    if (callback) {
      setTimeout(callback, VoiceSynth.callbackDelay / 1000);
    }
  }

  setVolume(vol) {
    this.volume = vol;
    if (this.playing) {
      this.amp.gain.linearRampToValueAtTime(vol, this.context.currentTime + 0.01);
    }
  }

  createSourceNodes() {
    this.sourceAspiration = new AudioWorkletNode(this.context, "Aspiration");

    this.sourceAspiration.connect(this.sourceGain);
  }

  setSourceType(name, firstTime) {
    if (!firstTime && this.sourceName === name) {
      return;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }

    this.sourceName = name;
    this.sourceNode = new AudioWorkletNode(this.context, name);
  }

  setSourceFrequency(frequency, firstTime) {
    if (!firstTime && this.sourceFrequency === frequency) {
      return;
    }

    this.sourceFrequency = frequency;

    const param = this.sourceNode.parameters.get('frequency');
    const time = this.context.currentTime;

    param.exponentialRampToValueAtTime(this.sourceFrequency, time + 0.05);
  }

  setSourceParams(parameters, firstTime) {
    delete parameters.frequency;

    if (!firstTime && _.isEqual(this.sourceParams, parameters)) {
      return;
    }

    this.sourceParams = parameters;

    Object.entries(parameters).forEach(([key, value]) => {
      if (this.sourceNode.parameters.has(key)) {
        const param = this.sourceNode.parameters.get(key);

        if (key !== 'frequency' && param.value !== value) {
          const time = this.context.currentTime;

          param.linearRampToValueAtTime(value, time + 0.025);
        }
      } else {
        throw new Error(`Source parameter "${key}" does not exist.`)
      }
    });
  }

  toggleFilters(flag) {
    this.filterPass = flag;
    this._setFilters(true);
  }

  setFormant(formants, callback) {
    const ii = [];

    for (const {i, frequency, gain, bandwidth} of formants) {
      if (frequency !== undefined) {
        this.formantF[i] = frequency;
      }
      if (gain !== undefined) {
        this.formantGain[i] = gain;
      }
      if (bandwidth !== undefined) {
        this.formantBw[i] = bandwidth;
      }

      ii.push(i);
    }

    this._setFilters(true, ii, callback);
  }

  _connectFilters() {
    if (this.filters) {
      this.filters.forEach(flt => flt.disconnect());
    }
    if (this.filterGain) {
      this.filterGain.forEach(flt => flt.disconnect());
    }
    this.prefiltGain.disconnect();
    this.zeroFilter.disconnect();
    this.sourceGain.disconnect();

    const N = this.formantF.length;

    this.filterGain = new Array(N);
    this.filters = new Array(N);

    for (let i = 0; i < N; ++i) {
      this.filterGain[i] = this.context.createGain();
      this.filters[i] = this.context.createBiquadFilter();
      this.filters[i].type = 'bandpass';

      this.prefiltGain.connect(this.filters[i])
          .connect(this.filterGain[i])
          .connect(this.amp);
    }

    this.zeroFilter.connect(this.amp);
  }

  _setFilters(change, j, callback) {

    this.sourceGain.disconnect();

    if (this.filterPass) {
      for (let i = 0; i < this.filters.length; ++i) {
        if (change === true && (j === undefined || j === i || (Array.isArray(j) && j.includes(i)))) {
          const gainNode = this.filterGain[i];
          const filter = this.filters[i];

          const Fi = this.formantF[i];
          const Qi = Fi / this.formantBw[i];
          const Gi = db2amp(this.formantGain[i]);

          const time = this.context.currentTime + 0.005;

          filter.frequency.linearRampToValueAtTime(Fi, time);
          filter.Q.linearRampToValueAtTime(Qi, time);
          gainNode.gain.linearRampToValueAtTime(Gi, time);
        }
      }

      this.sourceGain.connect(this.prefiltGain);
    } else {
      this.sourceGain.connect(this.amp);
    }

    if (callback !== undefined) {
      setTimeout(callback, VoiceSynth.callbackDelay / 1000);
    }
  }

}

export default VoiceSynth;