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

    this.volume = 1.0;
    this.playing = false;
    this.filterPass = false;

    this.formantF = [0, 0, 0, 0, 0];
    this._connectFilters();
  }

  loadModules() {
    return Promise.all([
      this.context.audioWorklet.addModule('static/wasm/glottalSources.js'),
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
    this.amp.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.05);
  }

  loadPreset(preset, callback, firstTime) {
    this.setSourceType(preset.source.name, firstTime);
    this.setSourceFrequency(preset.source.frequency);
    this.setSourceParams(preset.source.params);
    this.formantF = [...preset.formants.freqs];
    this.formantBw = [...preset.formants.bands];
    this.formantGain = [...preset.formants.gains];

    this.sourceGain.gain.value = 0.2;
    this.prefiltGain.gain.value = 0.000005;
    this.amp.gain.value = this.playing ? this.volume : 0;
    this._setFilters(true);

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
      channelCount: 2
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

    /*this.vocalTractFilter = new AudioWorkletNode(this.context, 'VTFilter');

    this.prefiltGain.connect(this.vocalTractFilter);
    this.vocalTractFilter.connect(this.amp);*/
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

    this.sourceGain.connect(this.prefiltGain);

    for (let i = 0; i < N; ++i) {
      this.filterGain[i] = this.context.createGain();
      this.filters[i] = this.context.createBiquadFilter();
      this.filters[i].type = 'bandpass';

      /*this.prefiltGain.connect(this.filters[i])
          .connect(this.filterGain[i])
          .connect(this.amp);*/
    }

    //this.zeroFilter.connect(this.amp);

    this.amp.connect(this.context.destination);
  }

  _setFilters(change, j, callback) {

    if (this.filterPass) {
      /*for (let i = 0; i < this.filters.length; ++i) {
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
      }*/

      /*for (let i = 0; i < this.formantF.length; ++i) {
        const paramFreq = this.vocalTractFilter.parameters.get('F' + (i + 1));
        paramFreq.setValueAtTime(this.formantF[i], this.context.currentTime + 0.05);

        const paramBand = this.vocalTractFilter.parameters.get('bw' + (i + 1));
        paramBand.setValueAtTime(this.formantBw[i], this.context.currentTime + 0.05);
      }*/

      try {
        this.sourceGain.disconnect(this.amp);
      } catch {
      }

      this.sourceGain.connect(this.prefiltGain);
    } else {
      try {
        this.sourceGain.disconnect(this.prefiltGain);
      } catch {
      }

      this.sourceGain.connect(this.amp);
    }

    if (callback !== undefined) {
      setTimeout(callback, VoiceSynth.callbackDelay / 1000);
    }
  }

}

export default VoiceSynth;