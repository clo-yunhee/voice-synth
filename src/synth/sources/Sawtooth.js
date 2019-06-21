import PeriodicWaveBuffer from './PeriodicWaveBuffer'

class Sawtooth extends PeriodicWaveBuffer {

    getDefaultParams() {
        return {}
    }

    getSample(t) {
        return 1 - t;
    };

}

export default Sawtooth;