
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