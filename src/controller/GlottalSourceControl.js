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
      'waveform',
      'vibratoRate',
      'vibratoExtent',
    ]);
  }

  onF0(frequency) {
    this.synth.setSourceFrequency(frequency);
    this.fireEvent('frequency', {frequency});
  }

  onModelParam(parameters) {
    this.synth.setSourceParams(parameters);

    this.synth.sourceNode.port.postMessage({type: 'getParameters'});
    this.requestPlotData(parameters);
  }

  onModelType(name) {
    this.synth.setSourceType(name);

    this.fireEvent('modelType', {name});
    this.synth.sourceNode.port.postMessage({type: 'getParameters'});
    this.requestPlotData();
  }

  onVibratoRate(rate) {
    this.synth.setVibratoRate(rate);
    this.fireEvent('vibratoRate', {rate});
  }

  onVibratoExtent(extent) {
    const depth = 2 ** (extent / 1200);

    this.synth.setVibratoDepth(depth);
    this.fireEvent('vibratoExtent', {extent});
  }

  requestPlotData() {
    this.synth.sourceNode.port.postMessage({type: 'createPlotData', nbPoints: plotNbPoints});
  }

}

export default GlottalSourceControl