class SourceGenerator extends AudioWorkletProcessor {

  constructor() {
    super();

    this.heapOutputBuffer = new HeapAudioBuffer(
        Module, RENDER_QUANTUM_FRAMES,
        2, MAX_CHANNEL_COUNT
    );

    // Initialise stuff
    this.onMessage({data: {type: 'setType', sourceType: 'LF'}});

    // Listen for a plot data request
    this.port.onmessage = this.onMessage.bind(this);
  }

  onMessage({data}) {
    if (data.type === "createPlotData") {
      this.sendPlotData(data.nbPoints);
    } else if (data.type === 'getParameters') {
      this.sendParameters();
    } else if (data.type === 'setParameters') {
      this.kernel.setParameters(data.parameters);
    } else if (data.type === 'setType') {
      this.kernel = new Module[data.sourceType]();
      this.kernel.resetParameters();
    } else {
      console.warn(`MessagePort event type ${data.type} does not exist.`, data);
    }
  }

  sendPlotData(nbPoints) {
    const array = new Array(nbPoints);
    this.kernel.createPlotData(array);
    this.port.postMessage({type: 'createPlotData', waveform: array});
  }

  sendParameters() {
    const parameters = this.kernel.getParameters().entries();
    this.port.postMessage({type: 'getParameters', parameters});
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    // Read F0 from the input.
    this.frequency = input[0][0] || this.frequency;

    // Stereo output.
    const channelCount = output.length;

    this.heapOutputBuffer.adaptChannel(channelCount);

    // basically acts like a k-rate audioparam
    this.kernel.setFrequency(this.frequency);
    this.kernel.process(this.heapOutputBuffer.getHeapAddress(), channelCount);

    for (let ch = 0; ch < channelCount; ++ch) {
      output[ch].set(this.heapOutputBuffer.getChannelData(ch));
    }

    return true;
  }

}

registerProcessor("SourceGenerator", SourceGenerator);