import PeriodicWaveBuffer from './PeriodicWaveBuffer'

class KLGLOTT88 extends PeriodicWaveBuffer {

  getDefaultParams() {
    return {
      Oq: 0.6
    }
  }

  getSample(t) {
    const {Oq} = this.params;

    if (t <= Oq) {
      const a = (27 / 4) / (Oq ** 2);
      const b = (27 / 4) / (Oq ** 3);

      return a * t ** 2 - b * t ** 3;
    } else {
      return 0;
    }
  };

}

export default KLGLOTT88;