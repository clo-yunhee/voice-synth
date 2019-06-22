import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";
import InputLabel from "@material-ui/core/InputLabel";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import React from "react";
import {Switch} from "@material-ui/core";

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

  onFormantFreq = (formantNb) => (evt, newValue) => {
    const i = Number(formantNb);
    const newFi = Math.pow(10, newValue);

    const newFormants = [...this.state.formants];
    newFormants[i] = newFi;

    this.setState({formants: newFormants});
    this.context.setFormantFreq(i, newFi);
  };

  onFormantBand = (formantNb) => (evt, newValue) => {
    const i = Number(formantNb);
    const newBwi = Math.pow(10, newValue);

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
                    <Switch value={this.state.toggle} onChange={this.onToggle}/>
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
                                id={`f-${formantNb}-freq`}
                                min={Math.log10(100)}
                                max={Math.log10(10000)}
                                value={Math.log10(this.state.formants[formantNb])}
                                onChange={this.onFormantFreq(formantNb)}
                            />
                          </Grid>
                          <Grid item className="formant-freq-value">
                            <Typography>
                              {Math.round(this.state.formants[formantNb])} Hz
                            </Typography>
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
                                id={`f-${formantNb}-band`}
                                min={Math.log10(10)}
                                max={Math.log10(2000)}
                                value={Math.log10(this.state.bandwidths[formantNb])}
                                onChange={this.onFormantBand(formantNb)}
                            />
                          </Grid>
                          <Grid item className="formant-band-value">
                            <Typography variant="body2">
                              {Math.round(this.state.bandwidths[formantNb])} Hz
                            </Typography>
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