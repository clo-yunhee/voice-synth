import AbstractControl from './AbstractControl'
import {frequencies, getFrequencyResponse, plotNbPoints} from "../components/vocalTract/VTResponse";
import {db2amp} from "../gainConversion";

const magResponse = new Float32Array(plotNbPoints);
const phaseResponse = new Float32Array(plotNbPoints);

class VocalTractControl extends AbstractControl {

  static controlName = 'vocalTract';

  constructor(parent) {
    super(parent);
    this.initHandlers([
      'toggle',
      'formant'
    ]);
  }

  withFrequencyResponse(formants) {
    // Get frequency response for each formant.
    for (const d of formants) {
      this.synth.filters[d.i].getFrequencyResponse(frequencies, magResponse, phaseResponse);

      const gain = db2amp(this.synth.formantGain[d.i]);

      d.response = getFrequencyResponse(magResponse, gain);
    }

    return formants;
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
      this.withFrequencyResponse(formants);

      this.fireEvent('formant', {formants});
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

  onGain(fst, snd) {
    if (!Array.isArray(fst)) {
      fst = [{i: fst, gain: snd}];
    }

    this.onFormant(fst);
  }

}

export default VocalTractControl