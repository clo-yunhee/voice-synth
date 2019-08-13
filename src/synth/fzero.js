const guardedEval = (fun) => (x) => {
  const fx = fun(x);
  if (!isFinite(fx)) {
    console.error('fzero: non-finite value encountered');
  } else if (isNaN(fx)) {
    console.error('fzero: NaN value encountered');
  }
  return fx;
};

function fzero(unsafeFun, x0) {

  const eps = Number.EPSILON;
  const mu = 0.5;

  const tolX = 1e-8;
  const maxiter = 5;
  const maxfev = +Infinity;

  const fun = guardedEval(unsafeFun);

  let x, fval;
  let info, niter, nfev;
  info = niter = nfev = 0;

  // Prepare...
  if (typeof x0 === 'number') {
    x0 = [x0];
  }

  let a = x0[0];
  let fa = fun(a);
  nfev++;

  let b, fb;
  if (x0.length > 1) {
    b = x0[1];
    fb = fun(b);
    nfev++;
  } else {
    // Try to get b.
    const aa = (a === 0) ? 1 : a;

    const bb = [0.9 * aa, 1.1 * aa, aa - 1, aa + 1, 0.5 * aa, 1.5 * aa, -aa, 2 * aa, -10 * aa, 10 * aa];
    for (b of bb) {
      fb = fun(b);
      nfev++;
      if (Math.sign(fa) * Math.sign(fb) <= 0) {
        break;
      }
    }
  }

  if (b < a) {
    [a, fa, b, fb] = [b, fb, a, fa];
  }

  if (Math.sign(fa) * Math.sign(fb) > 0) {
    console.error('fzero: not a valid initial bracketing');
    return false;
  }

  const slope0 = (fb - fa) / (b - a);

  if (fa === 0) {
    [b, fb] = [a, fa];
  } else if (fb === 0) {
    [a, fa] = [b, fb];
  }

  let u, fu;
  if (Math.abs(fa) < Math.abs(fb)) {
    [u, fu] = [a, fa];
  } else {
    [u, fu] = [b, fb];
  }

  let itype = 1;
  let c, fc, d, fd, e, fe, mba;
  d = e = u;
  fd = fe = fu;
  mba = mu * (b - a);

  while (niter < maxiter && nfev < maxfev) {
    switch (itype) {
      case 1:
        // The initial test.
        if (b - a <= 2 * (2 * Math.abs(u) * eps + tolX)) {
          [x, fval] = [u, fu];
          info = 1;
          break;
        }
        if (Math.abs(fa) <= 1e3 * Math.abs(fb)
            && Math.abs(fb) <= 1e3 * Math.abs(fa)) {
          // Secant step.
          c = u - (a - b) / (fa - fb) * fu;
        } else {
          // Bisection step.
          c = 0.5 * (a + b);
        }
        [d, fd] = [u, fu];
        itype = 5;
        break;
      case 2:
      case 3:
        const l = new Set([fa, fb, fd, fe]).size;
        if (l === 4) {
          // Inverse cubic interpolation.
          const q11 = (d - e) * fd / (fe - fd);
          const q21 = (b - d) * fb / (fd - fb);
          const q31 = (a - b) * fa / (fb - fa);
          const d21 = (b - d) * fd / (fd - fb);
          const d31 = (a - b) * fb / (fb - fa);
          const q22 = (d21 - q11) * fb / (fe - fb);
          const q32 = (d31 - q21) * fa / (fd - fa);
          const d32 = (d31 - q21) * fd / (fd - fa);
          const q33 = (d32 - q22) * fa / (fe - fa);
          c = a + q31 + q32 + q33;
        }
        if (l < 4 || Math.sign(c - a) * Math.sign(c - b) > 0) {
          // Quadratic interpolation + Newton
          const a0 = fa;
          const a1 = (fb - fa) / (b - a);
          const a2 = ((fd - fb) / (d - b) - a1) / (d - a);
          // Modification 1: this is simpler and does not seem to be worse.
          c = a - a0 / a1;
          if (a2 !== 0) {
            for (let i = 1; i <= itype; ++i) {
              const pc = a0 + (a1 + a2 * (c - b)) * (c - a);
              const pdc = a1 + a2 * (2 * c - a - b);
              if (pdc === 0) {
                c = a - a0 / a1;
                break;
              }
              c -= pc / pdc;
            }
          }
        }
        itype += 1;
        break;
      case 4:
        // Double secant step.
        c = u - 2 * (b - a) / (fb - fa) * fu;
        // Bisect if too far.
        if (Math.abs(c - u) > 0.5 * (b - a)) {
          c = 0.5 * (b + a);
        }
        itype = 5;
        break;
      case 5:
        // Bisection step.
        c = 0.5 * (b + a);
        itype = 2;
        break;
      default:
        break;
    }

    // Don't let c come too close to a or b.
    const delta = 2 * 0.7 * (2 * Math.abs(u) * eps * tolX);
    if (b - a <= 2 * delta) {
      c = (a + b) / 2;
    } else {
      c = Math.max(a + delta, Math.min(b - delta, c));
    }

    // Calculate new point.
    x = c;
    fval = fc = fun(c);
    niter++;
    nfev++;

    // Modification 2: skip inverse cubic interpolation if
    // nonmonotonicity is detected.
    if (Math.sign(fc - fa) * Math.sign(fc - fb) >= 0) {
      // The new point broke monotonicity.
      // Disable inverse cubic.
      fe = fc;
    } else {
      [e, fe] = [d, fd];
    }

    // Bracketing.
    if (Math.sign(fa) * Math.sign(fc) < 0) {
      [d, fd] = [b, fb];
      [b, fb] = [c, fc];
    } else if (Math.sign(fb) * Math.sign(fc) < 0) {
      [d, fd] = [a, fa];
      [a, fa] = [c, fc];
    } else if (fc === 0) {
      a = b = c;
      fa = fb = fc;
      info = 1;
      break;
    } else {
      // This should never happen.
      console.error('fzero: zero point is not bracketed');
    }

    if (Math.abs(fa) < Math.abs(fb)) {
      [u, fu] = [a, fa];
    } else {
      [u, fu] = [b, fb];
    }

    if (b - a <= 2 * (2 * Math.abs(u) * eps + tolX)) {
      info = 1;
      break;
    }

    // Skip bisection step if successful reduction.
    if (itype === 5 && (b - a) <= mba) {
      itype = 2;
    }
    if (itype === 2) {
      mba = mu * (b - a);
    }
  }

  // Check solution for a singularity by examining slope.
  if (info === 1) {
    if (b - a !== 0 && Math.abs((fb - fa) / (b - a) / slope0) > Math.max(1e6, 0.5 / (eps + tolX))) {
      info = -5;
    }
  }

  return {x, fval, info};
}

export default fzero;