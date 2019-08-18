import _ from 'lodash'
import AbstractControl from './AbstractControl'
import {plotNbPoints} from "../components/glottalSource/SourceGraph";

class GlottalSourceControl extends AbstractControl {

  static controlName = 'glottalSource';

  constructor(parent) {
    super(parent);
    this.initHandlers([
      'frequency',
      'modelType',
      'modelParams',
      'waveform'
    ]);

    this.subscribeEvent('modelType', this.handleModelType);
  }

  getSourceCorrectionFunc() {
    if (this.synth.sourceName === 'LiljencrantsFant') {
      return {
        Oq: (Oq) => ({am: {minValue: 0.74, maxValue: -0.23 * Oq + 1.01}})
      }
    } else {
      return {};
    }
  }

  getSourceParams() {
    const params = {};
    const range = {};

    const dynamic = this.getSourceCorrectionFunc();

    for (const [name, {value, minValue, maxValue}] of this.synth.sourceNode.parameters.entries()) {
      params[name] = value;
      range[name] = {minValue, maxValue};
    }

    for (const name of Object.keys(dynamic)) {
      const fn = dynamic[name];
      const p = range[name];

      Object.assign(range, fn(p));
    }

    return {params, range};
  }

  correctParams(params) {
    const {
      params: initialParams,
      range: initialRange
    } = this.getSourceParams();

    const dynamic = this.getSourceCorrectionFunc();

    let range = initialRange;
    let newParams = {...initialParams, ...params};

    // Iteratively update parameters until it becomes stable.
    do {
      params = newParams;
      newParams = {...params};

      for (const [key, value] of Object.entries(newParams)) {
        let {minValue, maxValue} = range[key];

        const newParam = this.correctParam(value, minValue, maxValue);

        newParams[key] = newParam.value;
        range[key] = {minValue: range.minValue, maxValue: newParam.maxValue};
      }

      for (const name of Object.keys(dynamic)) {
        const fn = dynamic[name];
        const p = range[name];

        Object.assign(range, fn(p));
      }
    } while (!_.isEqual(params, newParams));

    return {params, range};
  }

  correctParam(value, minValue, maxValue) {
    // Truncate to 2nd decimal place.
    minValue = Math.round(minValue * 100) / 100;
    maxValue = Math.round(maxValue * 100) / 100;

    let correctedValue = Math.round(value * 100) / 100;

    if (correctedValue < minValue) {
      correctedValue = minValue;
    }
    if (correctedValue > maxValue) {
      correctedValue = maxValue;
    }

    return {value: correctedValue, minValue, maxValue};
  }

  onF0(frequency) {
    this.synth.setSourceFrequency(frequency);
    this.fireEvent('frequency', {frequency});
  }

  onModelParam(params) {
    // Correct params if necessary.
    const {params: correctedParams, range} = this.correctParams(params);

    this.synth.setSourceParams(correctedParams);

    this.fireEvent('modelParams', {params: correctedParams, range});
    this.onWaveform(correctedParams);
  }

  onModelType(name) {
    this.synth.setSourceType(name);

    this.fireEvent('modelType', {name});
  }

  onWaveform(params) {
    const p = Object.entries(params).reduce((p, [key, {value}]) => {
      p[key] = value;
      return p;
    }, {});

    this.synth.sourceNode.port.postMessage({nbPoints: plotNbPoints, params: p});
  }

  handleModelType = (name) => {
    const defaultParams = {};
    for (const [name, {defaultValue}] of this.synth.sourceNode.parameters.entries()) {
      defaultParams[name] = defaultValue;
    }
    this.onModelParam(defaultParams);
  }

}

export default GlottalSourceControl