import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import Slider from "@material-ui/core/Slider";
import React from "react";

const minF = Math.log10(70);
const maxF = Math.log10(600);

class SourceFrequency extends React.PureComponent {

  onChange = (evt, value) => {
    // value in [0,100]
    // f in [min, max];

    const frequency = 10 ** (minF + (value / 100) * (maxF - minF));

    this.props.onChange(frequency);
  };

  render() {
    const {frequency} = this.props;

    // f in [min, max]
    const sliderValue = (Math.log10(frequency) - minF) * (100 / (maxF - minF));

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
                  value={sliderValue}
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