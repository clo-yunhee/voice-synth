import PeriodicWaveBuffer from './PeriodicWaveBuffer'

class CutoffSawtooth extends PeriodicWaveBuffer {

  getDefaultParams() {
    return {
      Oq: 0.6
    }
  }

  getParamRange() {
    return {
      Oq: {min: 0.2, max: 0.8}
    }
  }

  getSample(t) {
    if (t < this.params.Oq) {
      return 1 - t;
    } else {
      return 0;
    }
  };

}

export default CutoffSawtooth;