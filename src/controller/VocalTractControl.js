import AbstractControl from './AbstractControl'
import {frequencies} from "../components/vocalTract/VTResponse";

class VocalTractControl extends AbstractControl {

  static controlName = 'vocalTract';

  constructor(parent) {
    super(parent);
    this.initHandlers([
      'toggle',
      'formant',
      'frequencyResponse',
    ]);
  }

  onToggle(flag) {
    this.synth.toggleFilters(flag);
    this.fireEvent('toggle', {flag});
  }

  onFormant(formants) {
    if (!Array.isArray(formants)) {
      formants = [formants];
    }

    this.synth.setFormant(formants, () => {
      this.fireEvent('formant', {formants});
      this.requestFrequencyResponse();
    });
  }

  onFrequency(fst, snd) {
    if (!Array.isArray(fst)) {
      fst = [{i: fst, frequency: snd}];
    }

    this.onFormant(fst);
  }

  onBandwidth(fst, snd) {
    if (!Array.isArray(fst)) {
      fst = [{i: fst, bandwidth: snd}];
    }

    this.onFormant(fst);
  }

  requestFrequencyResponse() {
    this.synth.vocalTractFilter.port.postMessage({type: 'getFrequencyResponse', frequencies});
  }

}

export default VocalTractControl