import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import PlayIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import Slider from "@material-ui/lab/Slider";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem"
import React from "react";
import synthPresets from '../presets'

class ControlsNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.synth = this.props.synth;
    this.state = {selectedPreset: 'default', ...this.getSyncState()};
  }

  componentDidMount() {
    this.synth.addPresetListener(this.onPreset);
  }

  getSyncState() {
    return {
      playing: this.synth.playing,
      volume: this.synth.volume,
    }
  }

  onPreset = () => {
    this.setState(this.getSyncState());
  };

  onReset = () => {
    this.synth.loadPreset("default");
  };

  onLoadPreset = (evt) => {
    const id = evt.target.value;

    this.setState({selectedPreset: id});
    this.synth.loadPreset(id);
  };

  onPlayPause = () => {
    if (this.state.playing) {
      this.synth.stop();
      this.setState({playing: false});
    } else {
      this.synth.start();
      this.setState({playing: true});
    }
  };

  onVolume = (evt, newValue) => {
    this.setState({volume: newValue});
    this.synth.setVolume(newValue);
  };

  render() {
    return (
        <header className="App-controls">
          <Grid container className="App-controls-left">
            <Grid item>
              <Tooltip title="Start or pause the synthesizer">
                <IconButton
                    onClick={this.onPlayPause}
                    style={{color: "white"}}
                >
                  {this.state.playing ? <PauseIcon/> : <PlayIcon/>}
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item className="volume-slider-container">
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <VolumeDown style={{verticalAlign: "text-top"}}/>
                </Grid>
                <Grid item xs>
                  <Tooltip title="Adjust overall volume">
                    <Slider
                        min={0}
                        max={1}
                        value={this.state.volume}
                        onChange={this.onVolume}
                    />
                  </Tooltip>
                </Grid>
                <Grid item>
                  <VolumeUp style={{verticalAlign: "text-top"}}/>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container className="App-controls-right">
            <Grid item>
              <Tooltip title="Load synth presets">
                <Paper className="preset-card">
                  <Select
                      value={this.state.selectedPreset}
                      onChange={this.onLoadPreset}
                  >
                    {
                      Object.entries(synthPresets).map(([id, {name}]) => (
                          <MenuItem key={id} value={id}>{name}</MenuItem>
                      ))
                    }
                  </Select>
                </Paper>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Reset all parameters">
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={this.onReset}
                >
                  Reset
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </header>
    );
  }

}

export default ControlsNavbar;