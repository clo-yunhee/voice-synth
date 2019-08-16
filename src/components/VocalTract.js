import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import React from "react";
import VTHeader from './vocalTract/VTHeader'
import VTFormant from './vocalTract/VTFormant'
import VTResponse, {frequencies, plotNbPoints} from './vocalTract/VTResponse'
import VTVowels from "./vocalTract/VTVowels";
import AppContext from '../AppContext';

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
  }

  onToggle = (flag) => {
    this.context.vocalTract.onToggle(flag);
  };

  onFrequency = (i, frequency) => {
    this.context.vocalTract.onFrequency(i, frequency);
  };

  onGain = (i, gain) => {
    this.context.vocalTract.onGain(i, gain);
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
      formants: thisFormants,
      responses
    } = this.state;

    // Init overall-response array if needed.
    if (responses.length <= 5) {
      responses[5] = new Array(plotNbPoints);
      for (let k = 0; k < plotNbPoints; ++k) {
        responses[5][k] = {x: frequencies[k], y: 0};
      }
    }

    for (const {i, response, ...rest} of formants) {
      Object.assign(thisFormants[i], rest);

      // Update overall-response array.
      for (let k = 0; k < plotNbPoints; ++k) {
        if (Array.isArray(responses[i]) && responses[i].length > 0) {
          // Remove response from the old formant.
          responses[5][k].y -= responses[i][k].y;
        }
        // Add response from the new formant.
        responses[5][k].y += response[k].y;
      }

      responses[i] = response;
    }

    this.setState({formants: thisFormants, responses});
  };

  render() {
    const {
      toggled, formants, responses
    } = this.state;

    return (
        <>
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
                            onGain={this.onGain}
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
                <VTResponse data={responses}/>
              </Grid>
            </Grid>
          </Paper>
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
        </>
    );
  }

}

export default VocalTract;