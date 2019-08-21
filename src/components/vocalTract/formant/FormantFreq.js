import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import Tooltip from "@material-ui/core/Tooltip";
import Slider from "@material-ui/core/Slider";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import React from "react";
import AppContext from "../../../app/AppContext";

class FormantFreq extends React.PureComponent {

  static contextType = AppContext;

  onChangeLog = (event, value) => {
    this.onChange(10 ** value);
  };

  onChangeLin = (event) => {
    this.onChange(Number(event.target.value));
  };

  onChange = (frequency) => {
    this.props.onChange(this.props.i, frequency);
  };

  render() {
    const {i, frequency} = this.props;

    return (
        <Grid container spacing={1} direction="row" alignItems="center"
              className="formant-freq-container">
          <Grid item>
            <InputLabel>
              F<sub>{i + 1}</sub> =
            </InputLabel>
          </Grid>
          <Grid item className="formant-freq-slider-container">
            <Tooltip title={`Adjust which frequency band is emphasized by F${i + 1}`}>
              <Slider
                  min={Math.log10(150)}
                  max={Math.log10(6000)}
                  step={0.05}
                  value={Math.log10(frequency)}
                  onChange={this.onChangeLog}
              />
            </Tooltip>
          </Grid>
          <Grid item>
            <Grid container direction="row" alignItems="center">
              <Grid item>
                <TextField
                    type="number"
                    inputProps={{min: 10, max: 10000, step: 1}}
                    onChange={this.onChangeLin}
                    value={Math.round(frequency)}
                    className="formant-freq-value"
                />
              </Grid>
              <Grid item>
                <Typography>
                  Hz
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
    )
  }

}

export default FormantFreq;
