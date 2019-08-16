import SynthControl from './SynthControl'
import MediaControl from './MediaControl'
import GlottalSourceControl from "./GlottalSourceControl"
import VocalTractControl from './VocalTractControl'

function makeControl(synth) {
  const parent = new SynthControl(synth);

  new MediaControl(parent);
  new GlottalSourceControl(parent);
  new VocalTractControl(parent);

  return parent;
}

export default makeControl;