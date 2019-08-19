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

      // Get frequency response.
      const formants = this.synth.formantF.map((frequency, i) => ({
        i, frequency,
        gain: this.synth.formantGain[i],
        bandwidth: this.synth.formantBw[i]
      }));

      this.vocalTract.withFrequencyResponse(formants);

      // Get source.
      const {params, range} = this.glottalSource.getSourceParams();

      this.fireEvent('preset', {preset});
      this.fireEvent('glottalSource.frequency', {frequency: preset.source.frequency});
      this.fireEvent('glottalSource.modelType', {name: preset.source.name});
      this.fireEvent('glottalSource.modelParams', {params, range});
      this.fireEvent('vocalTract.toggle', {flag: this.synth.filterPass});
      this.fireEvent('vocalTract.formant', {formants});

      this.glottalSource.onVibratoRate(5);
      this.glottalSource.onVibratoExtent(80);

      this.synth.sourceNode.port.onmessage = ({data: waveform}) => {
        this.fireEvent('glottalSource.waveform', {waveform});
      };
      this.glottalSource.onWaveform(params);
    }, firstTime);
  }

}

export default SynthControl