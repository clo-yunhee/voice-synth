import React from 'react';
import Grid from '@material-ui/core/Grid';
import './App.css';
import VoiceSynth from './synth/VoiceSynth';
import Navbar from './components/Navbar';
import GlottalSource from "./components/GlottalSource"
import VocalTract from './components/VocalTract'
import Footer from "./components/Footer";
import makeControl from "./controller/make";
import AppContext from './AppContext'
import {defaultPreset} from "./presets";

class App extends React.PureComponent {

  constructor(props) {
    super(props);
    this.synth = new VoiceSynth();
    this.controller = makeControl(this.synth);
  }

  componentWillMount() {
    this.controller.onPreset(defaultPreset);
  }

  render() {
    return (
        <AppContext.Provider value={this.controller}>
          <div className="App">
            <Navbar/>
            <div className="App-wrapper">
              <Grid
                  container
                  spacing={4}
                  direction="column"
                  alignItems="flex-start"
                  alignContent="flex-start"
                  className="App-container"
              >
                <GlottalSource/>
                <VocalTract/>
              </Grid>
            </div>
            <Footer/>
          </div>
        </AppContext.Provider>
    );
  }
}

export default App;