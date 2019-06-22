import Sawtooth from './sources/Sawtooth'
import CutoffSawtooth from './sources/CutoffSawtooth'
import RosenbergC from "./sources/RosenbergC"

window.AudioContext = window.AudioContext || window.webkitAudioContext;

class VoiceSynth {

  constructor() {
    this.sources = {
      'sawtooth': new Sawtooth(),
      'cutoffSawtooth': new CutoffSawtooth(),
      'rosenbergC': new RosenbergC(),
    };
    this.reset = this.reset.bind(this);

    this.context = new AudioContext();
    this.sourceGain = this.context.createGain();
    this.vocalTractFilter = [];
    this.amp = this.context.createGain();

    this.formantF = [null, null, null, null, null];
    this._connectFilters();

    this.onReset = [];
    this.reset();

    this.amp.connect(this.context.destination);
  }

  start() {
    this.amp.gain.value = this.volume;
    this.playing = true;
  }

  stop() {
    this.playing = false;
    this.amp.gain.value = 0;
  }

  reset() {
    this.volume = 1.0;
    this.frequency = 150;
    this.sourceName = 'rosenbergC';
    this.playing = false;
    this.getSource().params = this.getSource().getDefaultParams();
    this._setSource();
    this.sourceGain.gain.value = 0.05;
    this.amp.gain.value = 0;
    this.filterPass = true;
    this.formantF = [730, 1090, 3010, 3350, 3850];
    this.formantBw = [90, 110, 170, 250, 300];
    this._setFilters();

    if (this.onReset) {
      this.onReset.forEach(fn => fn());
    }
  }

  addResetListener(callback) {
    this.onReset.push(callback);
  }

  setVolume(vol) {
    this.volume = vol;
    if (this.playing) {
      this.amp.gain.linearRampToValueAtTime(vol, this.context.currentTime + 0.025);
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
    this._connectFilters();
    if (flag) {
      this._setFilters();
    }
  }

  setFormantFreq(i, freq) {
    this.formantF[i] = freq;
    this._setFilters();
  }

  setFormantBw(i, bw) {
    this.formantBw[i] = bw;
    this._setFilters();
  }

  _setSource() {
    const source = this.getSource();
    const buffer = source.getBuffer(this.context, this.frequency);

    if (this.source) {
      this.source.stop();
      this.source.disconnect();
    }

    this.source = this.context.createBufferSource();
    this.source.buffer = buffer;
    this.source.loop = true;
    this.source.start();
    this.source.connect(this.sourceGain);
  }

  _connectFilters() {
    this.vocalTractFilter.forEach(flt => {
      flt.disconnect();
    });
    this.sourceGain.disconnect();

    this.vocalTractFilter = [];
    this.formantF.forEach(() => {
      const flt = this.context.createBiquadFilter();
      flt.type = "peaking";
      flt.gain.setValueAtTime(20, 0);

      this.vocalTractFilter.push(flt);
    });

    if (!this.filterPass || this.vocalTractFilter.length === 0) {
      this.sourceGain.connect(this.amp);
    } else {
      let prev = this.vocalTractFilter[0];

      this.sourceGain.connect(prev);

      for (let i = 1; i < this.vocalTractFilter.length; ++i) {
        const next = this.vocalTractFilter[i];
        prev.connect(next);
        prev = next;
      }

      prev.connect(this.amp);
    }
  }

  _setFilters() {
    for (let i = 0; i < this.vocalTractFilter.length; ++i) {
      const flt = this.vocalTractFilter[i];
      const Fi = this.formantF[i];
      const Qi = Fi / this.formantBw[i];

      flt.frequency.setValueAtTime(Fi, this.context.currentTime);
      flt.Q.setValueAtTime(Qi, this.context.currentTime);
    }
  }

}

export default VoiceSynth;