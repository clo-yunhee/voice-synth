class Aspiration extends AudioWorkletProcessor {

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    const openPhaseThreshold = 0.2;

    for (let ch = 0; ch < input.length; ++ch) {
      const inputChannel = input[ch];
      const outputChannel = output[ch];

      // Count open frames.
      let openFrames = 0;

      for (let i = 0; i < outputChannel.length; ++i) {
        if (inputChannel[i] > openPhaseThreshold) {
          openFrames++;
        }
      }

      // Compute glottal aspiration output.
      const noiseMul = openPhaseThreshold * (openFrames / outputChannel.length) ** 0.9 * 0.7;
      let lastOut = 0;

      for (let i = 0; i < outputChannel.length; ++i) {
        // Generate the noise even when not outputting, better distribution.
        const white = Math.random() * 2 - 1;

        // Brown noise.
        let noise = (lastOut + 0.02 * white) / 1.02;
        lastOut = noise;
        noise *= 3.5;

        outputChannel[i] = (inputChannel[i] || 0) * (1 + noiseMul * noise);
      }
    }

    return true;
  }
}

registerProcessor('Aspiration', Aspiration);