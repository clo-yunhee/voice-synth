import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";
import InputLabel from "@material-ui/core/InputLabel";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import React from "react";
import {Switch} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";

class VocalTract extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  componentDidMount() {
    this.context.addResetListener(this.onReset);
  }

  getInitialState() {
    // Values for an /a/ vowel.
    return {
      toggle: true,
      formants: [730, 1090, 2440, 3350, 3850],
      bandwidths: [90, 110, 170, 250, 300]
    }
  }

  onReset = () => {
    this.setState(this.getInitialState());
  };

  onToggle = (evt, newValue) => {
    this.setState({toggle: newValue});
    this.context.toggleFilters(newValue);
  };

  onFormantFreq = (formantNb, log) => (evt, newValue) => {
    const i = Number(formantNb);
    const newFi = log ? Math.pow(10, newValue) : Number(evt.target.value);

    const newFormants = [...this.state.formants];
    newFormants[i] = newFi;

    this.setState({formants: newFormants});
    this.context.setFormantFreq(i, newFi);
  };

  onFormantBand = (formantNb, log) => (evt, newValue) => {
    const i = Number(formantNb);
    const newBwi = log ? Math.pow(10, newValue) : Number(evt.target.value);

    const newBandwidths = [...this.state.bandwidths];
    newBandwidths[i] = newBwi;

    this.setState({bandwidths: newBandwidths});
    this.context.setFormantBw(i, newBwi);
  };

  render() {
    return (
        <Grid item>
          <Paper className="vt-container">
            <Grid container spacing={2} direction="column">
              <Grid item>
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
                    <Switch checked={this.state.toggle} onChange={this.onToggle}/>
                  </Grid>
                </Grid>
              </Grid>
              {
                Object.keys(this.context.formantF).map(formantNb => (
                    <React.Fragment key={formantNb}>
                      <Grid item>
                        <Divider variant="middle"/>
                      </Grid>
                      <Grid item>
                        <Grid container spacing={1} direction="row" alignItems="center"
                              className="formant-freq-container">
                          <Grid item>
                            <InputLabel>
                              F<sub>{Number(formantNb) + 1}</sub> =
                            </InputLabel>
                          </Grid>
                          <Grid item className="formant-freq-slider-container">
                            <Slider
                                min={Math.log10(100)}
                                max={Math.log10(10000)}
                                value={Math.log10(this.state.formants[formantNb])}
                                onChange={this.onFormantFreq(formantNb, true)}
                            />
                          </Grid>
                          <Grid item>
                            <Grid container direction="row" alignItems="center">
                              <Grid item>
                                <TextField
                                    type="number"
                                    inputProps={{min: 10, max: 10000, step: 1}}
                                    onChange={this.onFormantFreq(formantNb, false)}
                                    value={Math.round(this.state.formants[formantNb])}
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
                      </Grid>
                      <Grid item>
                        <Grid container spacing={1} direction="row" alignItems="center" justify="flex-end"
                              className="formant-band-container">
                          <Grid item>
                            <InputLabel shrink>
                              -3dB bandwidth:
                            </InputLabel>
                          </Grid>
                          <Grid item className="formant-band-slider-container">
                            <Slider
                                min={Math.log10(10)}
                                max={Math.log10(2000)}
                                value={Math.log10(this.state.bandwidths[formantNb])}
                                variant="continuous"
                                onChange={this.onFormantBand(formantNb, true)}
                            />
                          </Grid>
                          <Grid item>
                            <Grid container direction="row" alignItems="center">
                              <Grid item>
                                <TextField
                                    type="number"
                                    inputProps={{min: 10, max: 2000, step: 1}}
                                    onChange={this.onFormantBand(formantNb, false)}
                                    value={Math.round(this.state.bandwidths[formantNb])}
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
                    </React.Fragment>
                ))
              }
            </Grid>
          </Paper>
        </Grid>
    );
  }

}

export default VocalTract;