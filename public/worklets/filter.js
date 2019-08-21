const N = 5;

function formantDescriptor(k) {
  return [
    {name: `F${k}`, defaultValue: 150, minValue: 150, maxValue: 6000, automationRate: 'k-rate'},
    {name: `bw${k}`, defaultValue: 40, minValue: 10, maxValue: 400, automationRate: 'k-rate'},
  ];
}

function poly(z) {
  const N = z.length;

  const P_r = new Array(N + 1).fill(0);
  const P_i = new Array(N + 1).fill(0);

  P_r[0] = 1;

  for (let j = 0; j < N; ++j) {
    //P[1:j+1] -= z[j] * P[0:j];

    const {re: a, im: b} = z[j];

    for (let i = j; i >= 0; --i) {
      const c = P_r[i];
      const d = P_i[i];

      P_r[i + 1] -= a * c - b * d;
      P_i[i + 1] -= a * d + b * c;
    }
  }

  return P_r;
}

class VTFilter extends AudioWorkletProcessor {

  static get parameterDescriptors() {
    return [
      ...formantDescriptor(1),
      ...formantDescriptor(2),
      ...formantDescriptor(3),
      ...formantDescriptor(4),
      ...formantDescriptor(5),
    ];
  }

  constructor() {
    super();
    this.poles = new Array(2 * N);
    this.port.onmessage = () => {
      this.updateFilterCoefficients();
    };
  }

  hasChanged(params) {
    if (this.lastParams === undefined) {
      return true;
    }

    for (const [key, value] of Object.entries(params)) {
      if (this.lastParams[key][0] !== value[0]) {
        return true;
      }
    }

    return false;
  }

  updateLastParameters(params) {
    this.lastParams = {};

    for (const [key, value] of Object.entries(params)) {
      this.lastParams[key] = [...value];
    }
  }

  updateFilterCoefficients(params) {
    for (let j = 0; j < N; ++j) {
      const F = params['F' + (j + 1)][0];
      const Bw = params['bw' + (j + 1)][0];

      const r = Math.exp(-Math.PI * Bw / sampleRate);
      const phi = 2 * Math.PI * F / sampleRate;

      const x = r * Math.cos(phi);
      const y = r * Math.sin(phi);

      this.poles[j] = {re: x, im: y};
      this.poles[N + j] = {re: x, im: -y};
    }

    this.A = poly(this.poles);
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (this.hasChanged(parameters)) {
      this.updateFilterCoefficients(parameters);
    }

    this.updateLastParameters(parameters);

    if (this.lastOutput === undefined) {
      this.lastOutput = new Array(output.length);
    }

    for (let ch = 0; ch < input.length; ++ch) {
      const inputChannel = input[ch];
      const outputChannel = output[ch];

      if (this.lastOutput[ch] === undefined) {
        this.lastOutput[ch] = new Array(outputChannel.length).fill(0);
      }

      const lastOutput = this.lastOutput[ch];

      let amplitude = -Infinity;

      for (let n = 0; n < outputChannel.length; ++n) {

        let y = inputChannel[n];

        for (let k = 1; k < this.A.length; ++k) {
          const ynk = (k <= n)
              ? outputChannel[n - k]
              : lastOutput[outputChannel.length - 1 - k];

          y -= this.A[k] * (ynk || 0);
        }

        outputChannel[n] = y;
      }

      for (let n = 0; n < outputChannel.length; ++n) {
        lastOutput[n] = outputChannel[n];
      }

      console.log(inputChannel);
    }

    return true;
  }
}

registerProcessor('VTFilter', VTFilter);