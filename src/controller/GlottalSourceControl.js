import AbstractControl from './AbstractControl'
import {plotNbPoints} from "../components/glottalSource/SourceGraph";

class GlottalSourceControl extends AbstractControl {

  static controlName = 'glottalSource';

  constructor(parent) {
    super(parent);
    this.initHandlers([
      'frequency',
      'model'
    ]);
  }

  getSourceParams(p, source) {
    const paramRange = source.getParamRange();
    const params = {};

    Object.keys(p).forEach(key => {
      params[key] = {
        value: p[key],
        min: paramRange[key].min,
        max: paramRange[key].max
      };
    });

    return params;
  }

  getSourceWaveform(source) {
    const waveform = Array.from(source.getArray(plotNbPoints));

    for (let k = 0; k < plotNbPoints; ++k) {
      waveform[k] = {
        x: k / plotNbPoints,
        y: waveform[k]
      };
    }

    return waveform;
  }

  onFrequency(frequency) {
    this.synth.setSource({frequency});
    this.fireEvent('frequency', {frequency});
  }

  onModel(source) {
    const oldSource = this.synth.getSource();
    const paramRange = oldSource.getParamRange();

    if (this.synth.sourceName === source.name && source.params !== undefined) {
      // Check and coerce parameter within bounds in case they're inter-dependent.
      const oldParams = oldSource.params;
      Object.entries(oldParams).forEach(([key, value]) => {
        let {min, max} = paramRange[key];

        if (key in source.params) {
          value = source.params[key];
        }

        // Truncate to 2nd decimal place.
        min = Math.round(min * 100) / 100;
        max = Math.round(max * 100) / 100;

        let correctedValue = Math.round(value * 100) / 100;

        if (correctedValue < min) {
          correctedValue = min;
        }
        if (correctedValue > max) {
          correctedValue = max;
        }

        // If it has been corrected...
        if (correctedValue !== value) {
          source.params[key] = correctedValue;
        }
      });
    }

    this.synth.setSource(source);

    const newSource = this.synth.getSource();

    // Add min,max to the params set.
    const params = this.getSourceParams(newSource.params, newSource);
    const waveform = this.getSourceWaveform(newSource);

    this.fireEvent('model', {model: {type: this.synth.sourceName, params, waveform}});
  }

}

export default GlottalSourceControl