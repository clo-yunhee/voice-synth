import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import './App.css';
import VoiceSynth from './synth/VoiceSynth';
import ControlsNavbar from './components/ControlsNavbar'
import GlottalSource from "./components/GlottalSource";
import GlottalSourcePlot from "./components/GlottalSourcePlot";
import Footer from "./components/Footer";

class App extends React.PureComponent {

  static Context = React.createContext(null);

  constructor(props) {
    super(props);
    this.synth = new VoiceSynth();

    ControlsNavbar.contextType = App.Context;
    GlottalSource.contextType = App.Context;
  }

  render() {
    return (
        <App.Context.Provider value={this.synth}>
          <div className="App">
            <ControlsNavbar />
            <div className="App-wrapper">
              <Grid
                  container
                  spacing={4}
                  direction="column"
                  alignItems="flex-start"
                  alignContent="flex-start"
                  className="App-container"
              >
                <Grid item>
                  <GlottalSource />
                </Grid>
                <Grid item>
                  <GlottalSourcePlot />
                </Grid>
                <Grid item>
                  <Paper className="vt-picker-container">

                  </Paper>
                </Grid>
              </Grid>
            </div>
            <Footer />
          </div>
        </App.Context.Provider>
    );
  }
}

export default App;
