import _ from 'lodash'
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
    const paramRange = source.getParamRange(p);
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

  correctParam(value, min, max) {
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

    return correctedValue;
  }

  onFrequency(frequency) {
    this.synth.setSource({frequency});
    this.fireEvent('frequency', {frequency});
  }

  onModel(source) {
    if ((source.name === undefined || this.synth.sourceName === source.name)
        && source.params !== undefined) {
      const synthSource = this.synth.getSource();

      let range = synthSource.getParamRange();
      let params;
      let newParams = {...synthSource.params, ...source.params};

      // Iteratively update parameters until it becomes stable.
      do {
        params = newParams;
        newParams = {...params};

        for (const [key, value] of Object.entries(newParams)) {
          let {min, max} = range[key];

          newParams[key] = this.correctParam(value, min, max);
        }

        range = synthSource.getParamRange(newParams);

      } while (!_.isEqual(params, newParams));

      source.params = params;
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