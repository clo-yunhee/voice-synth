import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import React from "react";
import SourceFrequency from "./glottalSource/SourceFrequency";
import SourceParam from "./glottalSource/SourceParam";
import SourceGraph from "./glottalSource/SourceGraph";
import AppContext from "../app/AppContext";
import VibratoRate from "./glottalSource/VibratoRate";
import VibratoExtent from "./glottalSource/VibratoExtent";

class GlottalSource extends React.Component {

  static contextType = AppContext;
  static nbPoints = 256;

  constructor(props, context) {
    super(props);
    this.state = {
      frequency: 100,
      modelType: 'none',
      modelParams: [],
      vibratoRate: 5,
      vibratoExtent: 80,
    };
    context.subscribeEvent('glottalSource.frequency', this.handleFrequency);
    context.subscribeEvent('glottalSource.modelType', this.handleModelType);
    context.subscribeEvent('glottalSource.modelParams', this.handleModelParams);
    context.subscribeEvent('glottalSource.vibratoRate', this.handleVibratoRate);
    context.subscribeEvent('glottalSource.vibratoExtent', this.handleVibratoExtent);
    context.subscribeEvent('glottalSource.waveform', this.handleWaveform);
  }

  onF0 = (frequency) => {
    this.context.glottalSource.onF0(frequency);
  };

  onModelType = (evt) => {
    this.context.glottalSource.onModelType(evt.target.value);
  };

  onModelParam = (key, value) => {
    this.context.glottalSource.onModelParam({[key]: value});
  };

  onVibratoRate = (frequency) => {
    this.context.glottalSource.onVibratoRate(frequency);
  };

  onVibratoExtent = (cents) => {
    this.context.glottalSource.onVibratoExtent(cents);
  };

  handleFrequency = ({frequency}) => {
    this.setState({frequency});
  };

  handleModelType = ({name}) => {
    this.setState({modelType: name});
  };

  handleModelParams = ({parameters}) => {
    this.setState({modelParams: parameters});
  };

  handleWaveform = ({waveform}) => {
    this.setState({waveform});
  };

  handleVibratoRate = ({rate}) => {
    this.setState({vibratoRate: rate});
  };

  handleVibratoExtent = ({extent}) => {
    this.setState({vibratoExtent: extent});
  };

  render() {
    const {
      frequency,
      modelType, modelParams, modelParamRange,
      waveform,
      vibratoRate, vibratoExtent
    } = this.state;

    return (
        <>
          <Paper className="App-element">
            <Grid container spacing={2} direction="column" alignItems="flex-start">
              <Grid item>
                <Typography variant="subtitle2">
                  Glottal source
                </Typography>
              </Grid>
              <Grid item className="freq-slider-container">
                <SourceFrequency frequency={frequency} onChange={this.onF0}/>
              </Grid>
              <Grid item>
                <Select
                    value={modelType}
                    onChange={this.onModelType}
                >
                  <MenuItem value="CutoffSawtooth">Sawtooth with cut-off</MenuItem>
                  <MenuItem value="RosenbergC">Cosine Rosenberg model</MenuItem>
                  <MenuItem value="LF">Liljencrants-Fant model</MenuItem>
                  <MenuItem value="KLGLOTT88">KLGLOTT88 model</MenuItem>
                </Select>
              </Grid>
              {
                modelParams.map(([key, param]) => (
                    <Grid item key={key}>
                      <SourceParam
                          name={key}
                          value={param.value}
                          min={param.minValue}
                          max={param.maxValue}
                          onChange={this.onModelParam}
                      />
                    </Grid>
                ))
              }
              <Grid item>
                <VibratoRate rate={vibratoRate} onChange={this.onVibratoRate}/>
              </Grid>
              <Grid item>
                <VibratoExtent extent={vibratoExtent} onChange={this.onVibratoExtent}/>
              </Grid>
            </Grid>
          </Paper>
          <Paper className="App-element">
            <Grid container spacing={2} direction="column" alignItems="flex-start">
              <Grid item>
                <Typography variant="subtitle2">
                  Glottal flow waveshape
                </Typography>
              </Grid>
              <Grid item>
                <SourceGraph data={waveform}/>
              </Grid>
            </Grid>
          </Paper>
        </>
    );
  }

}

export default GlottalSource;