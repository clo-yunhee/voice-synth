import PeriodicWaveBuffer from './PeriodicWaveBuffer'

class KLGLOTT88 extends PeriodicWaveBuffer {

  getDefaultParams() {
    return {
      Oq: 0.6
    }
  }

  getParamRange() {
    return {
      Oq: {min: 0.2, max: 1}
    }
  }

  getSample(t) {
    const {Oq} = this.params;

    if (t <= Oq) {
      return t ** 2 / Oq ** 2 - t ** 3 / Oq ** 3;
    } else {
      return 0;
    }
  };

}

export default KLGLOTT88;