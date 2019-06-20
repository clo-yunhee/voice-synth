
window.AudioContext = window.AudioContext || window.webkitAudioContext;

class VoiceSynth {

    constructor() {
        this.context = new AudioContext();
        this.oscillator = this.context.createOscillator();
        this.sourceGain = this.context.createGain();
        this.vocalTractFilter = this.context.createBiquadFilter();
        this.amp = this.context.createGain();

        this.volume = 1.0;
        this.frequency = 150;
        this.playing = false;

        this.oscillator.type = 'sawtooth';
        this.oscillator.frequency.value = this.frequency;
        this.oscillator.start();
        this.oscillator.connect(this.sourceGain);

        this.sourceGain.gain.value = 0.2;
        this.sourceGain.connect(this.vocalTractFilter);

        this.vocalTractFilter.connect(this.amp);

        this.amp.gain.value = 0.0;
        this.amp.connect(this.context.destination);
    }

    start = () => {
        this.amp.gain.value = this.volume;
        this.playing = true;
    };

    stop = () => {
        this.playing = false;
        this.amp.gain.value = 0;
    };

    setVolume = (vol) => {
        this.volume = vol;
        if (this.playing) {
            this.amp.gain.linearRampToValueAtTime(vol, this.context.currentTime + 0.025);
        }
    };

    setFrequency = (freq) => {
        this.frequency = freq;
        this.oscillator.frequency.exponentialRampToValueAtTime(freq, this.context.currentTime + 0.05);
    }

}

export default VoiceSynth;