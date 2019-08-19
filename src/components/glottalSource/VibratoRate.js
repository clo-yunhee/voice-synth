import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import Slider from "@material-ui/core/Slider";
import React from "react";

class VibratoRate extends React.Component {

  onChange = (evt, rate) => {
    this.props.onChange(rate);
  };

  render() {
    const {rate} = this.props;

    return (
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography>
              Vibrato (rate)
            </Typography>
          </Grid>
          <Grid item className="vibrato-slider-container">
            <Tooltip title="The rate of vibrato, in Hz">
              <Slider
                  min={3}
                  max={9}
                  step={0.25}
                  value={rate}
                  onChange={this.onChange}
              />
            </Tooltip>
          </Grid>
          <Grid item className="vib-rate-slider-value">
            <Typography>
              {rate} Hz
            </Typography>
          </Grid>
        </Grid>
    )
  }

}

export default VibratoRate;