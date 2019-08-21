import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import Slider from "@material-ui/core/Slider";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import React from "react";
import AppContext from "../../../app/AppContext";

class FormantBand extends React.PureComponent {

  static contextType = AppContext;

  onChangeLog = (event, value) => {
    this.onChange(10 ** value);
  };

  onChangeLin = (event) => {
    this.onChange(Number(event.target.value));
  };

  onChange = (bandwidth) => {
    this.props.onChange(this.props.i, bandwidth);
  };

  render() {
    const {i, bandwidth} = this.props;

    return (
        <Grid item>
          <Grid
              container
              spacing={1}
              direction="row"
              alignItems="center"
              justify="flex-end"
              className="formant-band-container"
          >
            <Grid item>
              <Tooltip title="The bandwidth is measured at -3 dB below the center frequency">
                <Typography variant="caption">
                  Bandwidth:
                </Typography>
              </Tooltip>
            </Grid>
            <Grid item className="formant-band-slider-container">
              <Tooltip title={`Adjust the clarity of the frequencies emphasized by F${i + 1}`}>
                <Slider
                    min={Math.log10(10)}
                    max={Math.log10(400)}
                    step={0.05}
                    value={Math.log10(bandwidth)}
                    onChange={this.onChangeLog}
                />
              </Tooltip>
            </Grid>
            <Grid item>
              <Grid container direction="row" alignItems="center">
                <Grid item>
                  <TextField
                      type="number"
                      inputProps={{min: 10, max: 400, step: 1}}
                      onChange={this.onChangeLin}
                      value={Math.round(bandwidth)}
                      className="formant-band-value"
                  />
                </Grid>
                <Grid item>
                  <Typography variant="body2">
                    Hz
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
    )
  }

}

export default FormantBand;
