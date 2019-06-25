import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import React from "react";
import Graph from './Graph';
import GraphPlot from './GraphPlot';

class GlottalSource extends React.PureComponent {

  static nbPoints = 256;

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
      H0: this.synth.frequency,
      source: this.synth.sourceName,
      sourceParams: {...this.synth.getSource().params},
      sourceWave: this._getWaveData()
    };
  }

  onPreset = () => {
    this.setState(this.getSyncState());
  };

  onH0 = (evt, newValue) => {
    const newH0 = Math.pow(10, newValue);

    this.setState({H0: newH0});
    this.synth.setFrequency(newH0);
  };

  onSource = (evt) => {
    const newValue = evt.target.value;

    this.setState({source: newValue});
    this.synth.setSource(newValue);
    this._syncSourceParams();
  };

  onSourceParam = (paramKey) => (evt) => {
    const paramValue = evt.target.value;

    const {min, max} = this.synth.getSource().getParamRange()[paramKey];

    let coercedValue = Math.max(min, Math.min(max, paramValue));

    this.synth.setSourceParam(paramKey, coercedValue);
    this._syncSourceParams();
  };

  _syncSourceParams = () => {
    this.setState({
      sourceParams: {...this.synth.getSource().params},
      sourceWave: this._getWaveData()
    });
  };

  _getWaveData = () => {
    return this.synth.getSource().getArray(GlottalSource.nbPoints);
  };

  render() {
    return (
        <>
          <Grid item>
            <Paper className="source-container">
              <Grid container spacing={2} direction="column" alignItems="flex-start">
                <Grid item>
                  <Typography variant="subtitle2">
                    Glottal source
                  </Typography>
                </Grid>
                <Grid item className="freq-slider-container">
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Typography>
                        H<sub>0</sub>
                      </Typography>
                    </Grid>
                    <Grid item xs>
                      <Tooltip title="Fundamental frequency, otherwise known as pitch">
                        <Slider
                            min={Math.log10(50)}
                            max={Math.log10(500)}
                            value={Math.log10(this.state.H0)}
                            onChange={this.onH0}
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item className="freq-slider-value">
                      <Typography>
                        = {Math.round(this.state.H0)} Hz
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Select
                      value={this.state.source}
                      onChange={this.onSource}
                  >
                    <MenuItem value="sawtooth">Sawtooth</MenuItem>
                    <MenuItem value="cutoffSawtooth">Sawtooth with cut-off</MenuItem>
                    <MenuItem value="rosenbergC">Cosine Rosenberg model</MenuItem>
                    <MenuItem value="LF">Liljencrants-Fant model</MenuItem>
                    <MenuItem value="KLGLOTT88">KLGLOTT88 model</MenuItem>
                  </Select>
                </Grid>
                {
                  Object.entries(this.state.sourceParams).map(([key, value]) => (
                      <Grid item key={key}>
                        <Grid container spacing={1} alignItems="center">
                          <Grid item>
                            <InputLabel>
                              {key} =
                            </InputLabel>
                          </Grid>
                          <Grid item>
                            <TextField
                                type="number"
                                inputProps={{...this.synth.getSource().getParamRange()[key], step: 0.01}}
                                onChange={this.onSourceParam(key)}
                                value={value}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                  ))
                }
              </Grid>
            </Paper>
          </Grid>
          <Grid item>
            <Paper className="glottal-flow-container">
              <Grid container spacing={2} direction="column" alignItems="flex-start">
                <Grid item>
                  <Typography variant="subtitle2">
                    Glottal flow waveshape
                  </Typography>
                </Grid>
                <Grid item>
                  <Tooltip title="Shape of a glottal pulse cycle">
                    <Graph
                        width={GlottalSource.nbPoints}
                        height={GlottalSource.nbPoints * 9 / 16}
                        className="glottal-flow-svg"
                    >
                      <GraphPlot color="orange" data={this.state.sourceWave}/>
                    </Graph>
                  </Tooltip>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </>
    );
  }

}

export default GlottalSource;