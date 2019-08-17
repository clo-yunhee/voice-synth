import Grid from "@material-ui/core/Grid";
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import Slider from "@material-ui/core/Slider";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import React from "react";
import {defaultPreset} from '../presets'
import PlayPause from "./navbar/PlayPause";
import AppContext from "../AppContext";

class Navbar extends React.PureComponent {

  static contextType = AppContext;

  constructor(props, context) {
    super(props);
    this.state = {
      playing: false,
      volume: 1.0
    };
    context.subscribeEvent('media.toggle', this.handleToggle);
    context.subscribeEvent('media.volume', this.handleVolume);
  }

  onToggle = (flag) => {
    this.context.media.onToggle(flag);
  };

  onVolume = (evt, newValue) => {
    this.context.media.onVolume(newValue);
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