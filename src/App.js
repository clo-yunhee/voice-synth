import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/lab/Slider';
import PlayIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import reactLogo from './reactLogo.svg';
import muiLogo from './muiLogo.svg';
import './App.css';
import VoiceSynth from './VoiceSynth';

class App extends React.PureComponent {

  constructor(props) {
    super(props);
    this.synth = new VoiceSynth();
    this.state = {
      playing: false,
      volume: 1,
      H0: 150
    };
  }

  reset = () => {
    this.onVolume(null, 1);
    this.onH0(null, Math.log10(150));
  };

  onPlayPause = () => {
    if (this.state.playing) {
      this.synth.stop();
      this.setState({ playing: false });
    }
    else {
      this.synth.start();
      this.setState({ playing: true });
    }
  };

  onVolume = (evt, newValue) => {
    this.setState({ volume: newValue });
    this.synth.setVolume(newValue);
  };

  onH0 = (evt, newValue) => {
    const newH0 = Math.pow(10, newValue);

    this.setState({ H0: newH0 });
    this.synth.setFrequency(newH0);
  };

  render() {
    return (
        <div className="App">
          <header className="App-controls">
            <Grid container className="App-controls-left">
              <Grid item>
                <IconButton
                    onClick={this.onPlayPause}
                    style={{color: "white"}}
                >
                  {this.state.playing ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
              </Grid>
              <Grid item className="volume-slider-container">
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <VolumeDown style={{verticalAlign: "text-top"}} />
                  </Grid>
                  <Grid item xs>
                    <Slider
                        min={0}
                        max={1}
                        value={this.state.volume}
                        onChange={this.onVolume}
                    />
                  </Grid>
                  <Grid item>
                    <VolumeUp style={{verticalAlign: "text-top"}} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid container className="App-controls-right">
              <Grid item>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={this.reset}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </header>
          <div className="App-wrapper">
            <Grid container className="App-container">
              <Grid item className="freq-slider-container">
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Typography>
                      H<sub>0</sub>
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Slider
                        min={Math.log10(50)}
                        max={Math.log10(500)}
                        value={Math.log10(this.state.H0)}
                        onChange={this.onH0}
                    />
                  </Grid>
                  <Grid item className="freq-slider-value">
                    <Typography>
                      = {Math.round(this.state.H0)} Hz
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
          <footer className="App-footer">
            <img src={reactLogo} className="App-react-logo" alt="React logo" />
            <p>
              <span>Powered by </span>
              <a
                  className="App-link"
                  href="https://reactjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
              >
                React
              </a>
              <span> and </span>
              <a
                  className="App-link"
                  href="https://material-ui.com"
                  target="_blank"
                  rel="noopener noreferrer"
              >
                Material-UI
              </a>
            </p>
            <img src={muiLogo} className="App-mui-logo" alt="Material-UI logo" />
          </footer>
        </div>
    );
  }
}

export default App;
