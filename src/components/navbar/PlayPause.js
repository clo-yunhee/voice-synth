import React from 'react'
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import {Pause, PlayArrow} from "@material-ui/icons";
import Grid from "@material-ui/core/Grid";

class PlayPause extends React.PureComponent {

  onChange = () => {
    this.props.onChange(!this.props.playing);
  };

  render() {
    return (
        <Grid item>
          <Tooltip title="Start or pause the synthesizer">
            <IconButton
                onClick={this.onChange}
                style={{color: "white"}}
            >
              {this.props.playing ? <Pause/> : <PlayArrow/>}
            </IconButton>
          </Tooltip>
        </Grid>
    )
  }

}

export default PlayPause