import PeriodicWaveBuffer from "./PeriodicWaveBuffer";

class LiljencrantsFant extends PeriodicWaveBuffer {

  getDefaultParams() {
    return {
      Oq: 0.5,
      am: 0.8
    }
  }

  getParamRange(params) {
    params = params || this.params;

    // Empirical linear regression
    const max_am = -0.23 * params.Oq + 1.01;

    return {
      Oq: {min: 0.2, max: 0.8},
      am: {min: 0.74, max: max_am}
    }
  }

  getSample(t) {
    // p1 = Oq = Te
    // p2 = Ug'(Te) = E0 / Ee
    // p3 = 1 - am = 1 - Tp / Te
    const {Oq, am} = this.params;

    const p1 = Oq;
    const p2 = 0.1;
    const p3 = 1 - am;

    const te = p1;
    const mtc = te - 1;
    const e0 = 1;
    const wa = Math.PI / (te * (1 - p3));
    const a = -Math.log(-p2 * Math.sin(wa * te)) / te;
    const int_a = e0 * ((wa / Math.tan(wa * te) - a) / p2 + wa) / (a ** 2 + wa ** 2);

    // if int_a < 0 we should reduce p2
    // if int_a > 0.5 * p2 * (1 - te) we should increase p2
    const rb0 = p2 * int_a; // correct if rb << (1 - te)
    let rb = rb0;          // rb = 1 / eps

    // Use Newton method to determine rb.
    for (let i = 0; i < 4; ++i) {
      const kk = 1 - Math.exp(mtc / rb);
      const err = rb + mtc * (1 / kk - 1) - rb0;
      const d_err = 1 - (1 - kk) * (mtc / rb / kk) ** 2;

      rb -= err / d_err;
    }

    const e1 = 1 / (p2 * (1 - Math.exp(mtc / rb)));

    if (t < te) {
      return e0 * (Math.exp(a * t) * (a * Math.sin(wa * t) - wa * Math.cos(wa * t)) + wa) / (a ** 2 + wa ** 2);
    } else {
      return e1 * (Math.exp(mtc / rb) * (t - 1 - rb) + Math.exp((te - t) / rb) * rb);
    }
  };
}

export default LiljencrantsFant;