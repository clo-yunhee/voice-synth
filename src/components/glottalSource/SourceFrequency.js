import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import Slider from "@material-ui/lab/Slider";
import React from "react";

class SourceFrequency extends React.PureComponent {

  onChange = (evt, value) => {
    this.props.onChange(10 ** value);
  };

  render() {
    const {frequency} = this.props;

    return (
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography>
              F<sub>0</sub>
            </Typography>
          </Grid>
          <Grid item xs>
            <Tooltip title="Fundamental frequency, otherwise known as pitch">
              <Slider
                  min={Math.log10(70)}
                  max={Math.log10(600)}
                  value={Math.log10(frequency)}
                  onChange={this.onChange}
              />
            </Tooltip>
          </Grid>
          <Grid item className="freq-slider-value">
            <Typography>
              = {Math.round(frequency)} Hz
            </Typography>
          </Grid>
        </Grid>
    )
  }

}

export default SourceFrequency;