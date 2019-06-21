import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import PlayIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import Slider from "@material-ui/lab/Slider";
import Button from "@material-ui/core/Button";
import React from "react";

class ControlsNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  componentDidMount() {
    this.context.addResetListener(this.onReset);
  }

  getInitialState() {
    return {
      playing: false,
      volume: 1,
    }
  }

  onReset = () => {
    this.setState(this.getInitialState());
  };

  onPlayPause = () => {
    if (this.state.playing) {
      this.context.stop();
      this.setState({ playing: false });
    }
    else {
      this.context.start();
      this.setState({ playing: true });
    }
  };

  onVolume = (evt, newValue) => {
    this.setState({ volume: newValue });
    this.context.setVolume(newValue);
  };

  render() {
    return (
        <header className="App-controls">
          <Grid container className="App-controls-left">
            <Grid item>
              <IconButton
                  onClick={this.onPlayPause}
                  style={{color: "white"}}
              >
                {this.state.playing ? <PauseIcon/> : <PlayIcon/>}
              </IconButton>
            </Grid>
            <Grid item className="volume-slider-container">
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <VolumeDown style={{verticalAlign: "text-top"}}/>
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
                  <VolumeUp style={{verticalAlign: "text-top"}}/>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container className="App-controls-right">
            <Grid item>
              <Button
                  variant="contained"
                  color="secondary"
                  onClick={this.context.reset}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </header>
    );
  }

}

export default ControlsNavbar;