import PeriodicWaveBuffer from "./PeriodicWaveBuffer";
import newtonRaphson from '../netwonRaphson'

class LiljencrantsFant extends PeriodicWaveBuffer {

  getDefaultParams() {
    return {
      Rd: 0.4,
      Tc: 0.8
    }
  }

  getParamRange() {
    return {
      Rd: {min: 0.3, max: 2.7},
      Tc: {min: 0.3, max: 1}
    }
  }

  getSample(t) {
    const {Rd, Tc} = this.params;

    const Rk = 0.118 * Rd + 0.224;
    const Ra = 0.048 * Rd - 0.01;
    const Rg = (Rk / 4) * ((0.5 + 1.2 * Rk) / (0.11 * Rd - Ra * (0.5 + 1.2 * Rk)));

    const T0 = 1;
    const f0 = 1 / T0;
    const Ee = 1;

    const Te = (1 + Rk) / (2 * Rg * f0);
    const wg = 2 * Math.PI * Rg * f0;

    const Tb = Tc - Te;
    const Ta = e => (1 - Math.exp(-e * Tb)) / e;

    // Solve for epsilon
    const epsilon = newtonRaphson(
        e => e * Ta(e) - 1 + Math.exp(-e * Tb),
        e => Ta(e) - Tb * Math.exp(-e * Tb),
        2
    ) || 2;

    // Solve for alpha
    const E0 = a => -Ee / (Math.exp(a * Te) * Math.sin(wg * Te));
    const A0 = a => (E0(a) * Math.exp(a * Te)) / Math.sqrt(wg ** 2 + a ** 2) *
        Math.sin(wg * Te - Math.atan2(wg, a)) + (E0(a) * wg) / (wg ** 2 + a ** 2);

    const Ar = -Ee / (epsilon ** 2 * Ta(epsilon)) * (1 - Math.exp(-epsilon * Tb) * (1 + epsilon * Tb));

    const alpha = newtonRaphson(
        a => A0(a) + Ar,
        a => (1 - (2 * a * Ar) / Ee) * Math.sin(wg * Te) - wg * Te * Math.exp(-a * Te),
        .5
    ) || .5;

    if (t <= Te) {

      const X = 1 / (alpha ** 2 + wg ** 2);
      const Y = wg + Math.exp(alpha * t) * (alpha * Math.sin(wg * t) - wg * Math.cos(wg * t));

      return X * Y;

      //return E0(alpha) * Math.exp(alpha * t) * Math.sin(wg * t);
    } else if (t <= Tc) {

      /*const X = -Ee * (1 / (epsilon * Ta(epsilon)) - E0(alpha));
      const Y = T0 - t + (1 / epsilon) * (1 - Math.exp(epsilon * (T0 - t)));*/

      const X = 1 / (epsilon * Ta(epsilon));
      const Y = t => 1 / epsilon * Math.exp(-epsilon * (t - Te)) + t * Math.exp(-epsilon * Tb);

      const C = this.getSample(Te) - (X * Y(Te));

      return X * Y(t) + C;

      //return -Ee / (epsilon * Ta(epsilon)) * (Math.exp(-epsilon * (t - Te)) - Math.exp(-epsilon * Tb));
    } else {
      return 0;
    }

    /*
    const p1 = Oq;
    const p2 = 0.1;
    const p3 = 0.2;

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
    */
  };
}

export default LiljencrantsFant;