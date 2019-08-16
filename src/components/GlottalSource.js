import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import React from "react";
import SourceFrequency from "./glottalSource/SourceFrequency";
import SourceParam from "./glottalSource/SourceParam";
import SourceGraph from "./glottalSource/SourceGraph";
import AppContext from "../AppContext";

class GlottalSource extends React.Component {

  static contextType = AppContext;
  static nbPoints = 256;

  constructor(props, context) {
    super(props);
    this.state = {
      frequency: 100,
      model: {
        type: 'none', params: {}
      }
    };
    context.subscribeEvent('glottalSource.frequency', this.handleFrequency);
    context.subscribeEvent('glottalSource.model', this.handleModel);
  }

  onFrequency = (frequency) => {
    this.context.glottalSource.onFrequency(frequency);
  };

  onModelType = (evt) => {
    this.context.glottalSource.onModel({name: evt.target.value});
  };

  onModelParam = (key, value) => {
    this.context.glottalSource.onModel({params: {[key]: value}});
  };

  handleFrequency = ({frequency}) => {
    this.setState({frequency});
  };

  handleModel = ({model}) => {
    this.setState({model});
  };

  render() {
    const {frequency, model: {type, params, waveform}} = this.state;

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
                <SourceFrequency frequency={frequency} onChange={this.onFrequency}/>
              </Grid>
              <Grid item>
                <Select
                    value={type}
                    onChange={this.onModelType}
                >
                  <MenuItem value="cutoffSawtooth">Sawtooth with cut-off</MenuItem>
                  <MenuItem value="rosenbergC">Cosine Rosenberg model</MenuItem>
                  <MenuItem value="LF">Liljencrants-Fant model</MenuItem>
                  <MenuItem value="KLGLOTT88">KLGLOTT88 model</MenuItem>
                </Select>
              </Grid>
              {
                Object.entries(params).map(([key, {value, min, max}]) => (
                    <Grid item key={key}>
                      <SourceParam
                          name={key}
                          value={value}
                          min={min}
                          max={max}
                          onChange={this.onModelParam}
                      />
                    </Grid>
                ))
              }
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