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
import {HorizontalGridLines, LineSeries, XAxis, XYPlot, YAxis} from 'react-vis';
import VowelSpace from "./VowelSpace";
import {amp2db, db2amp} from '../gainConversion'

function formatTickHz(f) {
  const log2 = Math.log10(2);
  const log4 = Math.log10(0.5);
  const logf = Math.log10(f);

  if (logf % 1 === 0
      || (log2 + logf) % 1 === 0
      || (log4 + logf) % 1 === 0) {

    if (f < 1000) {
      return f + " Hz";
    } else {
      return (f / 1000) + " kHz";
    }
  }
}

class VocalTract extends React.PureComponent {

  static plotMinFreq = 50;
  static plotMaxFreq = 10800;
  static plotNbPoints = 512;
  static plotWidth = 576;
  static plotHeight = 360;
  static plotColors = ['orange', 'brown', 'green', 'red', 'magenta', 'black'];
  static plotThickness = [1, 1, 1, 1, 1, 1.5];

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

  onVowelSpaceChange = ({F1, F2, dragEnd}) => {
    const newFormants = [...this.state.formants];
    newFormants[0] = F1;
    newFormants[1] = F2;

    this.setState({formants: newFormants});

    if (!dragEnd) {
      this.synth.setFormantFreq(0, F1);
      this.synth.setFormantFreq(1, F2);
    } else {
      this.synth.setFormantFreq(0, F1, () => {
        this.synth.setFormantFreq(1, F2, () => {
          this.setState({filterResponse: this._getFrequencyResponse()});
        });
      });
    }
  };

  _getFrequencyResponse(j) {
    const response = [];

    const nbPoints = 2 * VocalTract.plotNbPoints;
    const freqs = new Float32Array(nbPoints);

    const minFreq = Math.log10(VocalTract.plotMinFreq);
    const maxFreq = Math.log10(VocalTract.plotMaxFreq);

    // Log scale.
    for (let k = 0; k < nbPoints; ++k) {
      freqs[k] = Math.pow(10, minFreq + (k * (maxFreq - minFreq)) / nbPoints);
    }

    const magResponse = new Float32Array(nbPoints);
    const phaseResponse = new Float32Array(nbPoints);

    const overallResponse = new Float32Array(nbPoints);

    const filters = this.synth.filters;

    for (let i = 0; i < filters.length; ++i) {
      if (j !== undefined && j !== i) {
        const r = this.state.filterResponse[i].map(d => d.y);

        response.push(r);
      } else {
        filters[i].getFrequencyResponse(freqs, magResponse, phaseResponse);
        for (let k = 0; k < nbPoints; ++k) {
          const gain = amp2db(magResponse[k]);

          if (i < this.state.gains.length) {
            magResponse[k] = gain + this.state.gains[i];
          } else {
            magResponse[k] = gain;
          }
        }

        response.push(Array.from(magResponse));
      }
    }

    // Overall response
    for (let k = 0; k < nbPoints; ++k) {
      overallResponse[k] = 0;
      for (let i = 0; i < filters.length; ++i) {
        overallResponse[k] += db2amp(response[i][k]);
      }
      overallResponse[k] = amp2db(overallResponse[k]);
    }

    response.push(Array.from(overallResponse));

    // Transform into XYPlottable format
    for (const r of response) {
      for (let k = 0; k < nbPoints; ++k) {
        r[k] = {x: freqs[k], y: r[k]};
      }
    }

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
                  <XYPlot
                      width={VocalTract.plotWidth}
                      height={VocalTract.plotHeight}
                      xType="log"
                      xDomain={[VocalTract.plotMinFreq, VocalTract.plotMaxFreq]}
                      yType="linear"
                      yDomain={[-150, 20]}
                  >
                    <HorizontalGridLines/>
                    {
                      Object.keys(this.state.filterResponse).map(i => (
                          <LineSeries
                              key={`vtf-plot-${i}`}
                              stroke={VocalTract.plotColors[i]}
                              strokeWidth={VocalTract.plotThickness[i]}
                              data={this.state.filterResponse[i]}
                          />
                      ))
                    }
                    <XAxis title="Frequency (Hz)" tickFormat={formatTickHz}/>
                    <YAxis title="Gain (dB)"/>
                  </XYPlot>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item>
            <Paper className="vt-vowel-container">
              <Grid container spacing={2} direction="column" alignItems="flex-start">
                <Grid item>
                  <Typography variant="subtitle2">
                    Vowel formant space
                  </Typography>
                </Grid>
                <Grid item>
                  <VowelSpace formants={this.state.formants} onChange={this.onVowelSpaceChange}/>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </>
    );
  }

}

export default VocalTract;