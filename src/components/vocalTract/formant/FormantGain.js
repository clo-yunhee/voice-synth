import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import React from "react";
import AppContext from "../../../AppContext";

class FormantGain extends React.PureComponent {

  static contextType = AppContext;

  onChange = (event) => {
    this.props.onChange(this.props.i, Number(event.target.value));
  };

  render() {
    const {gain} = this.props;

    return (
        <Grid item>
          <Grid
              container
              spacing={1}
              irection="row"
              alignItems="center"
              justify="flex-start"
              className="formant-gain-container"
          >
            <Grid item>
              <Typography variant="caption">
                Gain:
              </Typography>
            </Grid>
            <Grid item>
              <Grid container direction="row" alignItems="center">
                <Grid item>
                  <TextField
                      type="number"
                      inputProps={{min: -80, max: 0, step: 1}}
                      onChange={this.onChange}
                      value={Math.round(gain)}
                      className="formant-gain-value"
                  />
                </Grid>
                <Grid item>
                  <Typography variant="body2">
                    dB
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
    )
  }

}

export default FormantGain;
