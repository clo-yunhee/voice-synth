class PeriodicWaveBuffer {

  constructor() {
    this.params = this.getDefaultParams();
  }

  getBuffer(context, freq) {
    const len = context.sampleRate / freq;

    const buffer = context.createBuffer(2, len, context.sampleRate);
    const data = this.getArray(len, true);

    for (let ch = 0; ch < 2; ++ch) {
      buffer.copyToChannel(data, ch);
    }

    return buffer;
  }

  getArray(len, isForBuffer) {
    const samples = new Float32Array(len);

    for (let i = 0; i < len; ++i) {
      samples[i] = this.getSample(i / len);
    }

    let amp = 0;
    for (let i = 0; i < len; ++i) {
      const y = samples[i];
      if (Math.abs(y) > amp) {
        amp = Math.abs(y);
      }
      samples[i] = y;
    }

    // force normalisation above 0
    for (let i = 0; i < len; ++i) {
      samples[i] = Math.abs(samples[i]) <= 1e-13 ? 0 : samples[i] / Math.abs(amp);
      samples[i] = Math.min(1, Math.max(isForBuffer ? -1 : 0, samples[i]));
    }

    return samples;
  }

  getNoiseBuffer(context, buffer) {
    const data = buffer.getChannelData(0);

    const noiseLen = 1000 * data.length;
    const openThreshold = 0.25;

    const noise = context.createBuffer(2, noiseLen, context.sampleRate);

    const noiseData = [new Float32Array(noiseLen), new Float32Array(noiseLen)];

    // Add brown noise only during glottal opening. (threshold of 0.2)
    let openFrames = 0;

    let b = [0, 0, 0, 0, 0, 0, 0];
    let lastOut = [0, 0];

    for (let ch = 0; ch < 2; ++ch) {
      for (let i = 0; i < noiseLen; ++i) {
        if (data[i % data.length] >= openThreshold) {
          const white = Math.random() * 2 - 1;

          /*
          //white noise
          noiseData[i] = white;
          */

          /*
          //pink noise
          b[0] = 0.99886 * b[0] + white * 0.0555179;
          b[1] = 0.99332 * b[1] + white * 0.0750759;
          b[2] = 0.96900 * b[2] + white * 0.1538520;
          b[3] = 0.86650 * b[3] + white * 0.3104856;
          b[4] = 0.55000 * b[4] + white * 0.5329522;
          b[5] = -0.7616 * b[5] - white * 0.0168980;
          noiseData[i] = b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + white * 0.5362;
          noiseData[i] *= 0.11; // (roughly) compensate for gain
          b[6] = white * 0.115926;
          */

          //brown noise
          noiseData[ch][i] = (lastOut[ch] + 0.02 * white) / 1.02;
          lastOut[ch] = noiseData[ch][i];
          noiseData[ch][i] *= 3.5;

          openFrames++;
        } else {
          noiseData[ch][i] = 0;
        }
      }
    }

    // Scale noise based on proportion of open frames.
    const noiseAmp = (openFrames / (2 * noiseLen)) ** 0.9 * 0.3;

    for (let ch = 0; ch < 2; ++ch) {
      for (let i = 0; i < noiseLen; ++i) {
        noiseData[ch][i] *= noiseAmp;
      }
      noise.copyToChannel(noiseData[ch], ch);
    }

    return noise;
  }

  /**
   *  (Abstract method)
   * Returns a single sample of the periodic wave.
   *
   * @param t Time, normalised over [0,1)
   * @return Waveform point value, normalised over [-1,1]
   */
  getSample(t) {
    throw new Error('Unimplemented method');
  }

  /**
   *  (Abstract method)
   * Returns a dict of possible parameters of the periodic wave.
   */
  getDefaultParams() {
    throw new Error('Unimplemented method');
  }

  /**
   *  (Abstract method)
   * Returns a dict of parameter range (min, max).
   */
  getParamRange(params) {
    throw new Error('Unimplemented method');
  }

  /**
   * Returns true if should integrate before processing.
   */
  isDerivative() {
    return false;
  }

}

export default PeriodicWaveBuffer;