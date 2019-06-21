import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import React from "react";

class GlottalSource extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  componentDidMount() {
    this.context.addResetListener(this.onReset);
    this.setState({ sourceParams: {...this.context.getSource().params} });
  }

  getInitialState() {
    return {
      H0: 150,
      source: "rosenbergC",
    };
  }

  onReset = () => {
    this.setState(this.getInitialState());
  };

  onH0 = (evt, newValue) => {
    const newH0 = Math.pow(10, newValue);

    this.setState({ H0: newH0 });
    this.context.setFrequency(newH0);
  };

  onSource = (evt) => {
    const newValue = evt.target.value;

    this.setState({source: newValue});
    this.context.setSource(newValue);
    this._syncSourceParams();
    this._setStateSourceWave();
  };

  onSourceParam = (evt) => {
    const groups = evt.target.name.match(/s-([a-z0-9]+)/i);
    const paramKey = groups[1];
    const paramValue = evt.target.value;

    if (paramValue >= 0.01 && paramValue <= 0.99) {
      this.context.setSourceParam(paramKey, paramValue);
      this._syncSourceParams();
      this._setStateSourceWave();
    }
  };

  _syncSourceParams = () => {
    this.setState({ sourceParams: {...this.context.getSource().params} });
  };

  render() {
    return (
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
                  <Slider
                      min={Math.log10(50)}
                      max={Math.log10(500)}
                      value={Math.log10(this.state.H0)}
                      onChange={this.onH0}
                  />
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
              </Select>
            </Grid>
            {
              this.state.sourceParams ?
                Object.keys(this.context.getSource().params).map(paramKey => (
                  <Grid item key={paramKey}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <InputLabel>
                          {paramKey} =
                        </InputLabel>
                      </Grid>
                      <Grid item>
                        <TextField
                            name={`s-${paramKey}`}
                            type="number"
                            inputProps={{ min: 0.01, max: 0.99, step: 0.01 }}
                            onChange={this.onSourceParam}
                            value={this.state.sourceParams[paramKey]}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                ))
                  : undefined
            }
          </Grid>
        </Paper>
    );
  }

}

export default GlottalSource;