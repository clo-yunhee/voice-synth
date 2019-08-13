import PeriodicWaveBuffer from './PeriodicWaveBuffer'

class RosenbergC extends PeriodicWaveBuffer {

  getDefaultParams() {
    return {
      Oq: 0.52,
      am: 0.8
    }
  }

  getParamRange() {
    return {
      Oq: {min: 0.1, max: 0.9},
      am: {min: 0.51, max: 0.99}
    }
  }

  getSample(t) {
    const {Oq, am} = this.params;

    const Tp = Oq * am;
    const Tn = Oq * (1 - am);

    if (t <= Tp) {
      return .5 * (1 - Math.cos(Math.PI * t / Tp));
    } else if (t <= Tp + Tn) {
      return Math.cos(Math.PI / 2 * (t - Tp) / Tn);
    } else {
      return 0;
    }
  };

}

export default RosenbergC;