import React from 'react'
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import Switch from "@material-ui/core/Switch";
import AppContext from "../../AppContext";

class VTHeader extends React.PureComponent {

  static contextType = AppContext;

  onToggle = (evt, newValue) => {
    this.props.onChange(newValue);
  };

  render() {
    const {toggled} = this.props;

    return (
        <Grid container direction="row" justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="subtitle2">
              Vocal tract
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="caption">
              On/Off
            </Typography>
            <Tooltip title="Toggle the vocal tract filter">
              <Switch checked={toggled} onChange={this.onToggle}/>
            </Tooltip>
          </Grid>
        </Grid>
    )
  }

}

export default VTHeader;