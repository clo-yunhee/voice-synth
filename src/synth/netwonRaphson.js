function newton(f, fprime, guess, options) {

  options = options || {};

  const tolerance = options.tolerance || 0.00000001;
  const epsilon = options.epsilon || 0.0000000000001;
  const maxIterations = options.maxIterations || 20;

  let result;

  for (let i = 0; i < maxIterations; ++i) {
    const denominator = fprime(guess);
    if (Math.abs(denominator) < epsilon) {
      return false;
    }

    result = guess - (f(guess) / denominator);

    const resultWithinTolerance = Math.abs(result - guess) < tolerance;
    if (resultWithinTolerance) {
      return result;
    }

    guess = result;
  }

  return false;
}

export default newton;