class PeriodicWaveBuffer {

  constructor() {
    this.params = this.getDefaultParams();
  }

  getBuffer(context, freq) {
    const len = context.sampleRate / freq;

    const buffer = context.createBuffer(1, len, context.sampleRate);
    buffer.copyToChannel(this.getArray(len), 0);

    return buffer;
  }

  getArray(len) {
    const samples = new Float32Array(len);
    for (let i = 0; i < len; ++i) {
      samples[i] = this.getSample(i / len);
    }
    return samples;
  }

  getNoiseBuffer(context, buffer) {
    const data = buffer.getChannelData(0);

    const noiseLen = 100 * data.length;
    const noise = context.createBuffer(1, noiseLen, context.sampleRate);

    const noiseData = new Float32Array(noiseLen);

    // Add noise only during glottal opening. (threshold of 0.2)
    let openFrames = 0;

    for (let i = 0; i < noiseLen; ++i) {
      if (data[i % data.length] >= 0.2) {
        noiseData[i] = Math.random() - 0.5;
        openFrames++;
      } else {
        noiseData[i] = 0;
      }
    }

    // Scale noise based on proportion of open frames.
    const noiseAmp = (openFrames / noiseLen) * 0.06;

    for (let i = 0; i < noiseLen; ++i) {
      noiseData[i] *= noiseAmp;
    }

    noise.copyToChannel(noiseData, 0);

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

}

export default PeriodicWaveBuffer;