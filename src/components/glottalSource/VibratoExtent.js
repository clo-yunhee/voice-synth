import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import Slider from "@material-ui/core/Slider";
import React from "react";

class VibratoExtent extends React.Component {

  onChange = (evt, extent) => {
    this.props.onChange(extent);
  };

  render() {
    const {extent} = this.props;

    return (
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography>
              Vibrato (extent)
            </Typography>
          </Grid>
          <Grid item xs className="vibrato-slider-container">
            <Tooltip title="The extent of vibrato, in cents">
              <Slider
                  min={0}
                  max={300}
                  step={5}
                  value={extent}
                  onChange={this.onChange}
              />
            </Tooltip>
          </Grid>
          <Grid item className="vib-extent-slider-value">
            <Typography>
              {extent} cents
            </Typography>
          </Grid>
        </Grid>
    )
  }

}

export default VibratoExtent;