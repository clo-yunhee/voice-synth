import AbstractControl from './AbstractControl'

class SynthControl extends AbstractControl {

  static controlName = 'synth';

  constructor(parent) {
    super(parent);
    this.initHandlers([
      'preset'
    ]);
  }

  onPreset(id) {
    this.synth.loadPreset(id, (preset) => {

      // Get frequency response.
      const formants = this.synth.formantF.map((frequency, i) => ({
        i, frequency,
        gain: this.synth.formantGain[i],
        bandwidth: this.synth.formantBw[i]
      }));

      this.vocalTract.withFrequencyResponse(formants);

      // Get source.
      const synthSource = this.synth.getSource();
      const params = this.glottalSource.getSourceParams(preset.source.params, synthSource);
      const waveform = this.glottalSource.getSourceWaveform(synthSource);

      this.fireEvent('preset', {preset: preset.name});
      this.fireEvent('glottalSource.frequency', {frequency: preset.frequency});
      this.fireEvent('glottalSource.model', {model: {type: preset.source.name, params, waveform}});
      this.fireEvent('vocalTract.toggle', {flag: this.synth.filterPass});
      this.fireEvent('vocalTract.formant', {formants});
    });
  }

}

export default SynthControl