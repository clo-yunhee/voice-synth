class VTFilter extends AudioWorkletProcessor {

  constructor() {
    super();

    this.heapInputBuffer = new HeapAudioBuffer(
        FilterModule, RENDER_QUANTUM_FRAMES,
        2, MAX_CHANNEL_COUNT
    );
    this.heapOutputBuffer = new HeapAudioBuffer(
        FilterModule, RENDER_QUANTUM_FRAMES,
        2, MAX_CHANNEL_COUNT
    );

    this.kernel = new FilterModule.VTFilter();

    // Listen for a plot data request
    this.port.onmessage = this.onMessage.bind(this);
  }

  onMessage({data}) {
    if (data.type === 'getFrequencyResponse') {
      this.sendFrequencyResponse(data.frequencies);
    }
    else if (data.type === 'setFrequency') {
      const {i, frequency} = data.formant;
      this.kernel.setFrequency(i, frequency);
    }
    else if (data.type === 'setBandwidth') {
      const {i, bandwidth} = data.formant;
      this.kernel.setBandwidth(i, bandwidth);
    }
    else {
      console.warn(`MessagePort event type ${data.type} does not exist.`, data);
    }
  }

  sendFrequencyResponse(frequencies) {
    const response = new Array(frequencies.length);
    this.kernel.getFrequencyResponse(frequencies, response);
    this.port.postMessage({type: 'getFrequencyResponse', response});
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    const channelCount = output.length;

    this.heapInputBuffer.adaptChannel(channelCount);
    this.heapOutputBuffer.adaptChannel(channelCount);

    for (let ch = 0; ch < channelCount; ++ch) {
      this.heapInputBuffer.getChannelData(ch).set(input[ch]);
    }

    this.kernel.process(this.heapInputBuffer.getHeapAddress(), this.heapOutputBuffer.getHeapAddress(), channelCount);

    for (let ch = 0; ch < channelCount; ++ch) {
      output[ch].set(this.heapOutputBuffer.getChannelData(ch));
    }

    return true;
  }

}

registerProcessor("VTFilter", VTFilter);
