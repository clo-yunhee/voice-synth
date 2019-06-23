import React from 'react';
import Grid from '@material-ui/core/Grid';
import './App.css';
import VoiceSynth from './synth/VoiceSynth';
import ControlsNavbar from './components/ControlsNavbar'
import GlottalSource from "./components/GlottalSource";
import VocalTract from './components/VocalTract'
import Footer from "./components/Footer";

class App extends React.PureComponent {

  constructor(props) {
    super(props);
    this.synth = new VoiceSynth();
    this.synth.loadPreset();
  }

  render() {
    return (
        <div className="App">
          <ControlsNavbar synth={this.synth}/>
          <div className="App-wrapper">
            <Grid
                container
                spacing={4}
                direction="column"
                alignItems="flex-start"
                alignContent="flex-start"
                className="App-container"
            >
              <GlottalSource synth={this.synth}/>
              <VocalTract synth={this.synth}/>
            </Grid>
          </div>
          <Footer/>
        </div>
    );
  }
}

export default App;
