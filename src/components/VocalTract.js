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
import Graph from './Graph'
import GraphPlot from './GraphPlot'
import {db2gain, gain2db} from '../gainConversion'

class VocalTract extends React.PureComponent {

  static plotMinFreq = 100;
  static plotNbPoints = 512;
  static plotColors = ['orange', 'brown', 'green', 'red', 'magenta', 'black'];
  static plotThickness = [1, 1, 1, 1, 1, 1.25];

  constructor(props) {
    super(props);
    this.synth = this.props.synth;
    this.state = this.getSyncState();
    this.state.filterResponse = this._getFrequencyResponse();
  }

  componentDidMount() {
    this.synth.addPresetListener(this.onPreset);
  }

  getSyncState() {
    return {
      toggle: this.synth.filterPass,
      formants: this.synth.formantF,
      bandwidths: this.synth.formantBw,
      gains: this.synth.formantGain
    }
  }

  onPreset = () => {
    this.setState({...this.getSyncState(), filterResponse: this._getFrequencyResponse()});
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

    this.synth.setFormantFreq(i, newFi, () => {
      this.setState({filterResponse: this._getFrequencyResponse(i)});
    });
  };

  onFormantBand = (formantNb, log) => (evt, newValue) => {
    const i = Number(formantNb);
    const newBwi = log ? Math.pow(10, newValue) : Number(evt.target.value);

    const newBandwidths = [...this.state.bandwidths];
    newBandwidths[i] = newBwi;

    this.setState({bandwidths: newBandwidths});

    this.synth.setFormantBw(i, newBwi, () => {
      this.setState({filterResponse: this._getFrequencyResponse(i)});
    });
  };

  onFormantGain = (formantNb) => (evt) => {
    const i = Number(formantNb);
    const newGi = evt.target.value;

    const newGains = [...this.state.gains];
    newGains[i] = newGi;

    this.synth.setFormantGain(i, newGi, () => {
      this.setState({filterResponse: this._getFrequencyResponse(i)});
    });
  };

  /*onFormantModified = (formantNb) => () => {
    this.setState({filterResponse: this._getFrequencyResponse(formantNb)});
  };*/

  _getFrequencyResponse(j) {
    const nbFormants = this.synth.formantF.length;

    const response = new Array(nbFormants);

    const nbPoints = 2 * VocalTract.plotNbPoints;
    const freqs = new Float32Array(nbPoints);

    if (this.gainResponse === undefined) {
      this.gainResponse = new Array(nbFormants);
      for (let i = 0; i < nbFormants; ++i) {
        this.gainResponse[i] = new Float32Array(nbPoints);
      }
    }

    const minFreq = Math.log10(100);
    const maxFreq = Math.log10(10100);

    // Log scale.
    for (let k = 0; k < nbPoints; ++k) {
      freqs[k] = Math.pow(10, minFreq + (k * (maxFreq - minFreq)) / nbPoints);
    }

    const phaseResponse = new Float32Array(nbPoints);
    const overallResponse = new Float32Array(nbPoints);

    for (let i = 0; i < nbFormants; ++i) {
      response[i] = new Float32Array(nbPoints);

      if (j !== undefined && j !== i) {
        for (let k = 0; k < nbPoints; ++k) {
          overallResponse[k] += this.gainResponse[i][k];
          response[i][k] = this.state.filterResponse[i][k];
        }
      } else {
        this.synth.filters[i].getFrequencyResponse(freqs, this.gainResponse[i], phaseResponse);

        for (let k = 0; k < nbPoints; ++k) {
          // convert to dB
          this.gainResponse[i][k] *= db2gain(this.synth.formantGain[i]);
          overallResponse[k] += this.gainResponse[i][k];

          // transformation is for the plot to look nicer
          response[i][k] = gain2db(this.gainResponse[i][k]) / 150 + .95
        }
      }
    }

    for (let k = 0; k < nbPoints; ++k) {
      overallResponse[k] = gain2db(overallResponse[k]) / 150 + .95;
    }

    response.push(overallResponse);

    return response;
  }

  render() {
    return (
        <>
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
                          <Grid container direction="row" alignItems="center" justify="space-between">
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
                                          onChange={this.onFormantGain(formantNb)}
                                          value={Math.round(this.state.gains[formantNb])}
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
                                  <Tooltip title={`Adjust the clarity of the frequencies emphasized by F${formantNb}`}>
                                    <Slider
                                        min={Math.log10(10)}
                                        max={Math.log10(2000)}
                                        value={Math.log10(this.state.bandwidths[formantNb])}
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
                          </Grid>
                        </Grid>
                      </React.Fragment>
                  ))
                }
              </Grid>
            </Paper>
          </Grid>
          <Grid item>
            <Paper className="vt-plot-container">
              <Grid container spacing={2} direction="column" alignItems="flex-start">
                <Grid item>
                  <Typography variant="subtitle2">
                    Vocal tract frequency response
                  </Typography>
                </Grid>
                <Grid item>
                  <Graph
                      width={VocalTract.plotNbPoints}
                      height={VocalTract.plotNbPoints * 9 / 16}
                      className="vt-plot-svg"
                  >
                    {
                      Object.keys(this.state.filterResponse).map(i => (
                          <GraphPlot
                              key={`vtf-plot-${i}`}
                              color={VocalTract.plotColors[i]}
                              strokeWidth={VocalTract.plotThickness[i]}
                              data={this.state.filterResponse[i]}
                          />
                      ))
                    }
                  </Graph>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </>
    );
  }

}

export default VocalTract;