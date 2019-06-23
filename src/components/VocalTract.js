import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";
import InputLabel from "@material-ui/core/InputLabel";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import React from "react";

class VocalTract extends React.PureComponent {

  constructor(props) {
    super(props);
    this.synth = this.props.synth;
    this.state = this.getSyncState();
  }

  componentDidMount() {
    this.synth.addPresetListener(this.onPreset);
  }

  getSyncState() {
    return {
      toggle: this.synth.filterPass,
      formants: this.synth.formantF,
      bandwidths: this.synth.formantBw
    }
  }

  onPreset = () => {
    this.setState(this.getSyncState());
  };

  onToggle = (evt, newValue) => {
    this.setState({toggle: newValue});
    this.synth.toggleFilters(newValue);
  };

  onFormantFreq = (formantNb, log) => (evt, newValue) => {
    const i = Number(formantNb);
    const newFi = log ? Math.pow(10, newValue) : Number(evt.target.value);

    const newFormants = [...this.state.formants];
    newFormants[i] = newFi;

    this.setState({formants: newFormants});
    this.synth.setFormantFreq(i, newFi);
  };

  onFormantBand = (formantNb, log) => (evt, newValue) => {
    const i = Number(formantNb);
    const newBwi = log ? Math.pow(10, newValue) : Number(evt.target.value);

    const newBandwidths = [...this.state.bandwidths];
    newBandwidths[i] = newBwi;

    this.setState({bandwidths: newBandwidths});
    this.synth.setFormantBw(i, newBwi);
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
                    <Tooltip title="Toggle the vocal tract filter">
                      <Switch checked={this.state.toggle} onChange={this.onToggle}/>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
              {
                Object.keys(this.synth.formantF).map(formantNb => (
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
                            <Tooltip title={`Adjust which frequency band is emphasized by F${formantNb}`}>
                              <Slider
                                  min={Math.log10(100)}
                                  max={Math.log10(10000)}
                                  value={Math.log10(this.state.formants[formantNb])}
                                  onChange={this.onFormantFreq(formantNb, true)}
                              />
                            </Tooltip>
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
                            <Tooltip title="The bandwidth is measured at -3 dB below the center frequency">
                              <InputLabel shrink>
                                -3dB bandwidth:
                              </InputLabel>
                            </Tooltip>
                          </Grid>
                          <Grid item className="formant-band-slider-container">
                            <Tooltip title={`Adjust the clarity of the frequencies emphasized by F${formantNb}`}>
                              <Slider
                                  min={Math.log10(10)}
                                  max={Math.log10(2000)}
                                  value={Math.log10(this.state.bandwidths[formantNb])}
                                  variant="continuous"
                                  onChange={this.onFormantBand(formantNb, true)}
                              />
                            </Tooltip>
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