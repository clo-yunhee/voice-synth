window.AudioContext = window.AudioContext || window.webkitAudioContext;

class VoiceSynth {

  static callbackDelay = 0.01;

  constructor() {
    this.loadPreset = this.loadPreset.bind(this);

    this.context = new AudioContext();
    this.sourceGain = this.context.createGain();
    this.prefiltGain = this.context.createGain();
    this.amp = this.context.createGain();

    this.volume = 1.0;
    this.playing = false;
    this.filterPass = true;

    this.amp.connect(this.context.destination);
  }

  loadModules() {
    return Promise.all([
      this.context.audioWorklet.addModule('static/wasm/glottalSources.js'),
      this.context.audioWorklet.addModule('static/wasm/vocalTractFilter.js'),
      this.context.audioWorklet.addModule('worklets/aspiration.js')
    ]).then(this.createSourceNodes.bind(this));
  }

  start() {
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    this.amp.gain.setValueAtTime(0, this.context.currentTime);
    this.amp.gain.linearRampToValueAtTime(this.volume, this.context.currentTime + 0.05);
    this.playing = true;
  }

  stop() {
    this.playing = false;
    this.amp.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.1);
  }

  loadPreset(preset, callback, firstTime) {
    this.setSourceType(preset.source.name, firstTime);
    this.setSourceFrequency(preset.source.frequency);
    this.setSourceParams(preset.source.params);
    this.formantF = [...preset.formants.freqs];
    this.formantBw = [...preset.formants.bands];

    this.sourceGain.gain.value = 0.25;//0.2;
    this.prefiltGain.gain.value = 0.125;
    this.amp.gain.value = this.playing ? this.volume : 0;
    this._setFilters();

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
    /*-- Source setup */

    this.sourceNode = new AudioWorkletNode(this.context, 'SourceGenerator', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      channelCount: 2,
      outputChannelCount: [1]
    });

    this.sourceFrequency = this.context.createConstantSource();
    this.sourceAspiration = new AudioWorkletNode(this.context, 'Aspiration');

    this.sourceFrequency.start();
    this.sourceFrequency.connect(this.sourceNode);
    this.sourceNode.connect(this.sourceAspiration);
    this.sourceAspiration.connect(this.sourceGain);

    /*-- Vibrato setup */

    this.vibratoRate = this.context.createOscillator();
    this.vibratoDepth = this.context.createConstantSource();

    this.vibratoRate.type = 'sine';
    this.vibratoRate.frequency.value = 5;
    this.vibratoDepth.offset.value = 1.05;

    this.vibratoRate.start();
    this.vibratoDepth.start();

    // Multiply the source frequency by the vibrato depth multiplier.
    const mult = this.context.createGain();

    this.vibratoDepth.connect(mult);
    this.sourceFrequency.connect(mult.gain);

    // Get the difference.
    const neg = this.context.createGain();
    neg.gain.value = -1;

    this.sourceFrequency.connect(neg);

    const diff = this.context.createGain();
    neg.connect(diff.gain);
    mult.connect(diff.gain);

    // Plug that as the amplitude of the oscillator
    this.vibratoRate.connect(diff);
    diff.connect(this.sourceFrequency.offset);

    /*-- Filter setup */

    this.vocalTractFilter = new AudioWorkletNode(this.context, 'VTFilter', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      channelCount: 2,
      outputChannelCount: [1]
    });

    this.sourceGain.connect(this.prefiltGain);
    this.prefiltGain.connect(this.vocalTractFilter);
  }

  setSourceType(name, firstTime) {
    if (!firstTime && this.sourceName === name) {
      return;
    }

    this.sourceName = name;
    this.sourceNode.port.postMessage({type: 'setType', sourceType: name});
  }

  setSourceFrequency(frequency) {
    const param = this.sourceFrequency.offset;
    const time = this.context.currentTime;

    param.exponentialRampToValueAtTime(frequency, time + 0.15);
  }

  setSourceParams(parameters) {
    this.sourceNode.port.postMessage({type: 'setParameters', parameters});
  }

  setVibratoRate(rate) {
    this.vibratoRate.frequency.linearRampToValueAtTime(rate, this.context.currentTime + 0.05);
  }

  setVibratoDepth(depth) {
    this.vibratoDepth.offset.linearRampToValueAtTime(depth, this.context.currentTime + 0.05);
  }

  toggleFilters(flag) {
    this.filterPass = flag;
    this._setFilters();
  }

  setFormant(formants, callback) {
    for (const {i, frequency, bandwidth} of formants) {
      if (frequency !== undefined) {
        this.formantF[i] = frequency;
        this.vocalTractFilter.port.postMessage({type: 'setFrequency', formant: {i, frequency}});
      }
      if (bandwidth !== undefined) {
        this.formantBw[i] = bandwidth;
        this.vocalTractFilter.port.postMessage({type: 'setBandwidth', formant: {i, bandwidth}});
      }
    }

    if (callback !== undefined) {
      setTimeout(callback, VoiceSynth.callbackDelay / 1000);
    }
  }

  _setFilters(callback) {

    if (this.filterPass) {
      this.setFormant(this.formantF.map((frequency, i) => ({i, frequency, bandwidth: this.formantBw[i]})));

      try {
        this.sourceGain.disconnect(this.amp);
      } catch {}

      this.vocalTractFilter.connect(this.amp);
    }
    else {
      try {
        this.vocalTractFilter.disconnect(this.amp);
      } catch {}

      this.sourceGain.connect(this.amp);
    }

    if (callback !== undefined) {
      setTimeout(callback, VoiceSynth.callbackDelay / 1000);
    }
  }

}

export default VoiceSynth;