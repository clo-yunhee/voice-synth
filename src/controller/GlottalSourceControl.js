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

  roundSourceParam(y) {
    return Math.round(y * 100) / 100;
  }

  roundSourceParams(params, range) {
    for (const name of Object.keys(params)) {
      params[name] = this.roundSourceParam(params[name]);
      range[name].minValue = this.roundSourceParam(range[name].minValue);
      range[name].maxValue = this.roundSourceParam(range[name].maxValue);
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
      const p = params[name];

      Object.assign(range, fn(p));
    }

    this.roundSourceParams(params, range);

    return {params, range};
  }

  correctSourceParams(params) {
    const {
      params: initialParams,
      range: initialRange
    } = this.getSourceParams();

    const dynamic = this.getSourceCorrectionFunc();

    let range = initialRange;
    let newParams = {...initialParams, ...params};

    console.log('initial', initialParams);
    console.log('params', params);

    console.log('merge', newParams);

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
        const p = params[name];

        Object.assign(range, fn(p));
      }

    } while (!_.isEqual(params, newParams));

    params = newParams;

    return {params, range};
  }

  correctParam(value, minValue, maxValue) {
    // Truncate to 2nd decimal place.
    let correctedValue;

    if (value < minValue) {
      correctedValue = minValue;
    }
    if (value > maxValue) {
      correctedValue = maxValue;
    }

    return {value: correctedValue || value, minValue, maxValue};
  }

  onF0(frequency) {
    this.synth.setSourceFrequency(frequency);
    this.fireEvent('frequency', {frequency});
  }

  onModelParam(params) {
    // Correct params if necessary.
    const {params: correctedParams, range} = this.correctSourceParams(params);

    this.synth.setSourceParams(correctedParams);

    this.fireEvent('modelParams', {params: correctedParams, range});
    this.onWaveform(correctedParams);
  }

  onModelType(name) {
    this.synth.setSourceType(name);

    this.fireEvent('modelType', {name});
  }

  onWaveform(params) {
    this.synth.sourceNode.port.postMessage({nbPoints: plotNbPoints, params: params});
  }

  handleModelType = (name) => {
    /*const defaultParams = {};
    for (const [name, {defaultValue}] of this.synth.sourceNode.parameters.entries()) {
      defaultParams[name] = this.roundSourceParam(defaultValue);
    }
    this.onModelParam(defaultParams);*/
  }

}

export default GlottalSourceControl