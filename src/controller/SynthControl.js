import AbstractControl from './AbstractControl'

class SynthControl extends AbstractControl {

  static controlName = 'synth';

  constructor(parent) {
    super(parent);
    this.initHandlers([
      'preset'
    ]);
  }

  onPreset(preset, firstTime) {
    this.synth.loadPreset(preset, () => {

      this.synth.sourceNode.port.onmessage = this.handleSourceMessage.bind(this);
      this.synth.vocalTractFilter.port.onmessage = this.handleVTMessage.bind(this);

      // Get frequency response.
      const formants = this.synth.formantF.map((frequency, i) => ({
        i, frequency, bandwidth: this.synth.formantBw[i]
      }));

      this.fireEvent('preset', {preset});
      this.fireEvent('glottalSource.frequency', {frequency: preset.source.frequency});
      this.fireEvent('glottalSource.modelType', {name: preset.source.name});

      this.glottalSource.onVibratoRate(5);
      this.glottalSource.onVibratoExtent(50);

      this.synth.sourceNode.port.postMessage({type: 'getParameters'});

      this.fireEvent('vocalTract.toggle', {flag: this.synth.filterPass});
      this.fireEvent('vocalTract.formant', {formants});

      this.glottalSource.requestPlotData();
      this.vocalTract.requestFrequencyResponse();
    }, firstTime);
  }

  handleSourceMessage({data: {type, ...data}}) {
    if (type === 'createPlotData') {
      this.fireEvent('glottalSource.waveform', {waveform: data.waveform});
    } else if (type === 'getParameters') {
      // Round each parameter to 1e-2.
      for (const entry of data.parameters) {
        const param = entry[1];

        for (const [opt, value] of Object.entries(param)) {
          param[opt] = Math.round(value * 100) / 100;
        }
      }
      this.fireEvent('glottalSource.modelParams', {parameters: data.parameters});
    }
  }

  handleVTMessage({data: {type, ...data}}) {
    if (type === 'getFrequencyResponse') {
      this.fireEvent('vocalTract.frequencyResponse', {response: data.response});
    }
  }

}

export default SynthControl