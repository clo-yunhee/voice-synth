import React from "react";
import Grid from "@material-ui/core/Grid";
import FormantFreq from "./formant/FormantFreq";
import FormantGain from "./formant/FormantGain";
import FormantBand from "./formant/FormantBand";
import AppContext from "../../app/AppContext";

class VTFormant extends React.Component {

  static contextType = AppContext;

  render() {
    const {
      i, formant: {frequency, gain, bandwidth},
      onFrequency, onGain, onBandwidth
    } = this.props;

    return (
        <Grid container spacing={2} direction="column">
          <Grid item>
            <FormantFreq i={i} frequency={frequency} onChange={onFrequency}/>
          </Grid>
          <Grid item>
            <Grid container direction="row" alignItems="center" justify="space-between">
              <Grid item>
                <FormantGain i={i} gain={gain} onChange={onGain}/>
              </Grid>
              <Grid item>
                <FormantBand i={i} bandwidth={bandwidth} onChange={onBandwidth}/>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
    );
  }

}

export default VTFormant;