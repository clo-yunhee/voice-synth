import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import React from "react";
import VTHeader from './vocalTract/VTHeader'
import VTFormant from './vocalTract/VTFormant'
import VTResponse, {frequencies, plotNbPoints} from './vocalTract/VTResponse'
import VTVowels from "./vocalTract/VTVowels";
import AppContext from '../app/AppContext';

const df = () => ({frequency: 150, gain: -6, bandwidth: 20});
const dr = () => [];

class VocalTract extends React.Component {

  static contextType = AppContext;

  constructor(props, context) {
    super(props);
    this.state = {
      toggled: false,
      formants: [df(), df(), df(), df(), df()],
      responses: [dr(), dr(), dr(), dr(), dr()]
    };
    context.subscribeEvent('vocalTract.toggle', this.handleToggle);
    context.subscribeEvent('vocalTract.formant', this.handleFormantUpdate);
    context.subscribeEvent('vocalTract.frequencyResponse', this.handleResponse);
  }

  onToggle = (flag) => {
    this.context.vocalTract.onToggle(flag);
  };

  onFrequency = (i, frequency) => {
    this.context.vocalTract.onFrequency(i, frequency);
  };

  onBandwidth = (i, bandwidth) => {
    this.context.vocalTract.onBandwidth(i, bandwidth);
  };

  onVowel = (F1, F2) => {
    this.context.vocalTract.onFrequency([
      {i: 0, frequency: F1},
      {i: 1, frequency: F2}
    ]);
  };

  handleToggle = ({flag}) => {
    this.setState({toggled: flag});
  };

  handleFormantUpdate = ({formants}) => {
    const {
      formants: thisFormants
    } = this.state;

    for (const {i, ...rest} of formants) {
      Object.assign(thisFormants[i], rest);
    }

    this.setState({formants: thisFormants});
  };

  handleResponse = ({response}) => {
    this.setState({response});
  };

  render() {
    const {
      toggled, formants, response
    } = this.state;

    return (
        <>
          <Paper className="App-element">
            <Grid container spacing={2} direction="column" alignItems="flex-start">
              <Grid item>
                <Typography variant="subtitle2">
                  Vowel formant space
                </Typography>
              </Grid>
              <Grid item>
                <VTVowels
                    formants={formants}
                    onChange={this.onVowel}
                />
              </Grid>
            </Grid>
          </Paper>
          <Paper className="App-element">
            <Grid container spacing={2} direction="column">
              <Grid item>
                <VTHeader
                    toggled={toggled}
                    onChange={this.onToggle}
                />
              </Grid>
              {
                formants.map((formant, i) => (
                    <React.Fragment key={i}>
                      <Grid item>
                        <Divider variant="middle"/>
                      </Grid>
                      <Grid item>
                        <VTFormant
                            i={i}
                            formant={formant}
                            onFrequency={this.onFrequency}
                            onBandwidth={this.onBandwidth}
                        />
                      </Grid>
                    </React.Fragment>
                ))
              }
            </Grid>
          </Paper>
          <Paper className="App-element">
            <Grid container spacing={2} direction="column" alignItems="flex-start">
              <Grid item>
                <Typography variant="subtitle2">
                  Vocal tract frequency response
                </Typography>
              </Grid>
              <Grid item>
                <VTResponse data={response}/>
              </Grid>
            </Grid>
          </Paper>
        </>
    );
  }

}

export default VocalTract;