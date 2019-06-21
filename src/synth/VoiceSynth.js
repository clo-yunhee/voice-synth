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
        this.vocalTractFilter = this.context.createBiquadFilter();
        this.amp = this.context.createGain();

        this.onReset = [];
        this.reset();

        this.sourceGain.connect(this.vocalTractFilter);
        this.vocalTractFilter.connect(this.amp);
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
        this.sourceGain.gain.value = 0.2;
        this.amp.gain.value = 0;

        if (this.onReset) {
            this.onReset.forEach(fn => fn());
        }
    }

    addResetListener(callback) {
        this.onReset[this.onReset.length] = callback;
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
        }
        else {
            throw Error("'Property doesn't exist.");
        }

        this._setSource();
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

}

export default VoiceSynth;