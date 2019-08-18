import {db2amp} from '../gainConversion'
import {defaultPreset} from "../presets";

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

    this.context.audioWorklet.addModule('worklets/sources.js')
        .then(() => {
          this.loadPreset(defaultPreset);
        });
  }

  async start() {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    this.amp.gain.setValueAtTime(0, this.context.currentTime);
    this.amp.gain.linearRampToValueAtTime(this.volume, this.context.currentTime + 0.05);
    this.playing = true;
  }

  stop() {
    this.playing = false;
    this.amp.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.05);
  }

  loadPreset(preset, callback) {
    this.sourceFrequency = preset.source.frequency;
    this.sourceParams = {...preset.source.params};
    this.setSourceType(preset.source.name);
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

  setSourceType(name) {
    this.sourceNode = new AudioWorkletNode(this.context, name);
    this.setSourceFrequency();
  }

  setSourceFrequency(frequency) {
    if (frequency !== undefined) {
      this.sourceFrequency = frequency;
    }

    const param = this.sourceNode.parameters.get('frequency');
    const time = this.context.currentTime + 0.1;

    param.linearRampToValueAtTime(this.sourceFrequency, time);
  }

  setSourceParams(parameters) {
    if (parameters !== undefined) {
      this.sourceParams = parameters;
    }

    Object.entries(this.sourceParams).forEach(([key, value]) => {
      if (this.sourceNode.parameters.has(key)) {
        const param = this.sourceNode.parameters.get(key);
        const time = this.context.currentTime + 0.1;

        param.linearRampToValueAtTime(value, time);
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

      this.prefiltGain.connect(this.filters[i]);
      this.filters[i].connect(this.filterGain[i]);
      this.filterGain[i].connect(this.amp);
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