import CutoffSawtooth from './sources/CutoffSawtooth'
import RosenbergC from "./sources/RosenbergC"
import LiljencrantsFant from "./sources/LiljencrantsFant"
import KLGLOTT88 from "./sources/KLGLOTT88"
import synthPresets from "../presets"
import {db2gain} from '../gainConversion'

window.AudioContext = window.AudioContext || window.webkitAudioContext;

class VoiceSynth {

  static callbackDelay = 25;

  constructor() {
    this.sources = {
      'cutoffSawtooth': new CutoffSawtooth(),
      'rosenbergC': new RosenbergC(),
      'LF': new LiljencrantsFant(),
      'KLGLOTT88': new KLGLOTT88(),
    };
    this.onPreset = [];
    this.loadPreset = this.loadPreset.bind(this);

    this.context = new AudioContext();
    this.sourceGain = this.context.createGain();
    this.prefiltGain = this.context.createGain();
    this.amp = this.context.createGain();

    this.sourceGain.connect(this.prefiltGain);
    this.amp.connect(this.context.destination);

    this.formantF = [0, 0, 0, 0, 0];
    this._connectFilters();
  }

  start() {
    this.amp.gain.value = this.volume;
    this.playing = true;
  }

  stop() {
    this.playing = false;
    this.amp.gain.value = 0;
  }

  loadPreset(id) {
    if (!id) {
      id = "default";
    }

    const preset = synthPresets[id];

    this.frequency = preset.frequency;
    this.sourceName = preset.source.name;
    this.getSource().params = {...preset.source.params};
    this._setSource();
    this.formantF = [...preset.formants.freqs];
    this.formantBw = [...preset.formants.bands];
    this.formantGain = [...preset.formants.gains];

    this.volume = 1.0;
    this.playing = true;
    this.filterPass = true;
    this.sourceGain.gain.value = 0.2;
    this.prefiltGain.gain.value = 5;
    this.amp.gain.value = this.volume;
    this._setFilters(true);

    if (this.onPreset) {
      setTimeout(() => {
        this.onPreset.forEach(fn => fn())
      }, VoiceSynth.callbackDelay);
    }
  }

  addPresetListener(callback) {
    this.onPreset.push(callback);
  }

  setVolume(vol) {
    this.volume = vol;
    if (this.playing) {
      this.amp.gain.exponentialRampToValueAtTime(vol, this.context.currentTime + 0.025);
    }
  }

  setFrequency(freq) {
    this.frequency = freq;
    this._setSource();
  }

  setSource(name) {
    this.sourceName = name;
    this._setSource();
  }

  getSource() {
    return this.sources[this.sourceName];
  }

  setSourceParam(key, value) {
    const source = this.getSource();

    if (source.params.hasOwnProperty(key)) {
      source.params[key] = Number(value);
    } else {
      throw Error("'Property doesn't exist.");
    }

    this._setSource();
  }

  toggleFilters(flag) {
    this.filterPass = flag;
    this._setFilters(true);
  }

  setFormantFreq(i, freq, callback) {
    this.formantF[i] = freq;
    this._setFilters(true, i, callback);
  }

  setFormantBw(i, bw, callback) {
    this.formantBw[i] = bw;
    this._setFilters(true, i, callback);
  }

  setFormantGain(i, gain, callback) {
    this.formantGain[i] = gain;
    this._setFilters(true, i, callback);
  }

  _setSource() {
    if (this.source) {
      this.source.stop();
      this.source.disconnect();
    }

    if (this.breath) {
      this.breath.stop();
      this.breath.disconnect();
    }

    const source = this.getSource();
    const buffer = source.getBuffer(this.context, this.frequency);

    this.source = this.context.createBufferSource();
    this.source.buffer = buffer;
    this.source.loop = true;
    this.source.start();
    this.source.connect(this.sourceGain);

    const noiseBuffer = source.getNoiseBuffer(this.context, buffer);

    this.breath = this.context.createBufferSource();
    this.breath.buffer = noiseBuffer;
    this.breath.loop = true;
    this.breath.start();
    this.breath.connect(this.sourceGain);
  }

  _connectFilters() {
    if (this.filters) {
      this.filters.forEach(flt => flt.disconnect());
    }
    if (this.preflt) {
      this.preflt.forEach(flt => flt.disconnect());
    }
    this.prefiltGain.disconnect();
    this.sourceGain.disconnect();

    const N = this.formantF.length;

    this.preflt = new Array(N);
    this.filters = new Array(N);

    for (let i = 0; i < N; ++i) {
      this.preflt[i] = this.context.createGain();
      this.filters[i] = this.context.createBiquadFilter();
      this.filters[i].type = 'bandpass';

      this.prefiltGain.connect(this.preflt[i]);
      this.preflt[i].connect(this.filters[i]);
      this.filters[i].connect(this.amp);
    }
  }

  _setFilters(change, i, callback) {

    this.sourceGain.disconnect();

    if (this.filterPass) {
      for (let j = 0; j < this.filters.length; ++j) {
        const gainNode = this.preflt[j];
        const filter = this.filters[j];
        if (change === true && (i === undefined || i === j)) {
          const Fi = this.formantF[j];
          const Qi = Fi / this.formantBw[j];
          const Gi = db2gain(this.formantGain[j]);

          const time = this.context.currentTime + (VoiceSynth.callbackDelay / 2000);

          filter.frequency.exponentialRampToValueAtTime(Fi, time);
          filter.Q.exponentialRampToValueAtTime(Qi, time);
          gainNode.gain.exponentialRampToValueAtTime(Gi, time);
        }
      }

      this.sourceGain.connect(this.prefiltGain);
    } else {
      this.sourceGain.connect(this.amp);
    }

    if (callback !== undefined) {
      setTimeout(callback, VoiceSynth.callbackDelay);
    }
  }

}

export default VoiceSynth;