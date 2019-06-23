import Sawtooth from './sources/Sawtooth'
import CutoffSawtooth from './sources/CutoffSawtooth'
import RosenbergC from "./sources/RosenbergC"
import LiljencrantsFant from "./sources/LiljencrantsFant";
import KLGLOTT88 from "./sources/KLGLOTT88";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

class VoiceSynth {

  constructor() {
    this.sources = {
      'sawtooth': new Sawtooth(),
      'cutoffSawtooth': new CutoffSawtooth(),
      'rosenbergC': new RosenbergC(),
      'LF': new LiljencrantsFant(),
      'KLGLOTT88': new KLGLOTT88(),
    };
    this.reset = this.reset.bind(this);

    this.context = new AudioContext();
    this.sourceGain = this.context.createGain();
    this.prefiltGain = this.context.createGain();
    this.amp = this.context.createGain();

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
    this.frequency = 170;
    this.sourceName = 'KLGLOTT88';
    this.playing = false;
    this.getSource().params = this.getSource().getDefaultParams();
    this._setSource();
    this.sourceGain.gain.value = 0.1;
    this.prefiltGain.gain.value = 10e-7;
    this.amp.gain.value = 0;
    this.filterPass = true;
    this.formantF = [730, 1090, 3010, 3350, 3850];
    this.formantBw = [90, 110, 170, 250, 300];
    this.poles = new Array(2 * this.formantF.length);
    this._setFilters(true);

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
    this._setFilters(false);
  }

  setFormantFreq(i, freq) {
    this.formantF[i] = freq;
    this._setFilters(true, i);
  }

  setFormantBw(i, bw) {
    this.formantBw[i] = bw;
    this._setFilters(true, i);
  }

  _setSource() {
    const source = this.getSource();
    const buffer = source.getBuffer(this.context, this.frequency);

    // Add breath (wide-band noise) to opening.
    const noiseBuffer = source.getNoiseBuffer(this.context, buffer);

    if (this.source) {
      this.source.stop();
      this.source.disconnect();
    }
    if (this.breath) {
      this.breath.stop();
      this.breath.disconnect();
    }

    this.source = this.context.createBufferSource();
    this.source.buffer = buffer;
    this.source.loop = true;
    this.source.start();
    this.source.connect(this.sourceGain);

    this.breath = this.context.createBufferSource();
    this.breath.buffer = noiseBuffer;
    this.breath.loop = true;
    this.breath.start();
    this.breath.connect(this.sourceGain);
  }

  _setFilters(change, i) {
    /*for (let i = 0; i < this.vocalTractFilter.length; ++i) {
      const flt = this.vocalTractFilter[i];
      const Fi = this.formantF[i];
      const Qi = Fi / this.formantBw[i];

      flt.frequency.setValueAtTime(Fi, this.context.currentTime);
      flt.Q.setValueAtTime(Qi, this.context.currentTime);
    }*/

    if (this.filter) {
      this.filter.disconnect();
    }
    this.prefiltGain.disconnect();
    this.sourceGain.disconnect();

    if (this.filterPass) {
      if (change === true) {
        const {B, A} = this._calculateFilters(change, i);
        this.filter = this.context.createIIRFilter(B, A);
      }

      this.sourceGain.connect(this.prefiltGain);
      this.prefiltGain.connect(this.filter);
      this.filter.connect(this.amp);
    } else {
      this.sourceGain.connect(this.amp);
      this.breath.connect(this.amp);
    }
  }

  _calculateFilters(change, i) {
    const N = this.formantF.length;
    const fs = this.context.sampleRate;

    for (let j = 0; j < N; ++j) {
      if (i === undefined || j === i) {
        const F = this.formantF[j];
        const Bw = this.formantBw[j];

        const r = Math.exp(-Math.PI * Bw / fs);
        const phi = 2 * Math.PI * F / fs;

        const re = r * Math.cos(phi);
        const im = r * Math.sin(phi);

        this.poles[j] = {re, im};
        this.poles[N + j] = {re, im: -im};
      }
    }

    const B = [1];
    const A = VoiceSynth._calculatePoly(this.poles);

    return {B, A};
  }

  static _calculatePoly(z) {
    const N = z.length;
    const Pre = new Array(N + 1);
    const Pim = new Array(N + 1);

    Pre.fill(0);
    Pim.fill(0);

    Pre[0] = 1;

    for (let k = 0; k < N; ++k) {
      //P[1:k+1] = P[1:k+1] - z[k] * P[0:k];

      const {re, im} = z[k];

      for (let i = k; i >= 0; --i) {
        Pre[i + 1] -= re * Pre[i] - im * Pim[i];
        Pim[i + 1] -= re * Pim[i] + im * Pre[i];
      }
    }

    return Pre;
  }

}

export default VoiceSynth;