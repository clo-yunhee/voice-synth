import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import Slider from "@material-ui/lab/Slider";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem"
import React from "react";
import synthPresets, {defaultPreset} from '../presets'
import PlayPause from "./navbar/PlayPause";
import AppContext from "../AppContext";

class Navbar extends React.PureComponent {

  static contextType = AppContext;

  constructor(props, context) {
    super(props);
    this.state = {
      playing: false,
      volume: 1.0,
      preset: ''
    };
    context.subscribeEvent('media.toggle', this.handleToggle);
    context.subscribeEvent('media.volume', this.handleVolume);
    context.subscribeEvent('preset', this.handlePreset);
  }

  onToggle = (flag) => {
    this.context.media.onToggle(flag);
  };

  onVolume = (evt, newValue) => {
    this.context.media.onVolume(newValue);
  };

  onPreset = (evt) => {
    this.context.onPreset(evt.target.value);
  };

  onReset = () => {
    this.context.onPreset(defaultPreset);
  };

  handleToggle = ({flag}) => {
    this.setState({playing: flag});
  };

  handleVolume = ({volume}) => {
    this.setState({volume});
  };

  handlePreset = ({preset}) => {
    this.setState({preset});
  };

  render() {
    return (
        <header className="App-controls">
          <Grid container className="App-controls-left">
            <PlayPause
                playing={this.state.playing}
                onChange={this.onToggle}
            />
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
                        step={0.01}
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
                      value={this.state.preset}
                      onChange={this.onPreset}
                  >
                    {
                      Object.values(synthPresets).map(({name}) => (
                          <MenuItem key={name} value={name}>{name}</MenuItem>
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

export default Navbar;
