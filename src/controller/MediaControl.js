import AbstractControl from './AbstractControl'

class MediaControl extends AbstractControl {

  static controlName = 'media';

  constructor(parent) {
    super(parent);
    this.initHandlers([
      'toggle',
      'volume'
    ]);
  }

  onToggle(flag) {
    if (flag) {
      this.synth.start();
    } else {
      this.synth.stop();
    }
    this.fireEvent('toggle', {flag});
  }

  onVolume(volume) {
    this.synth.setVolume(volume);
    this.fireEvent('volume', {volume});
  }

}

export default MediaControl