import React from "react";
import Grid from "@material-ui/core/Grid";
import FormantFreq from "./formant/FormantFreq";
import FormantBand from "./formant/FormantBand";
import AppContext from "../../app/AppContext";

class VTFormant extends React.Component {

  static contextType = AppContext;

  render() {
    const {
      i, formant: {frequency, bandwidth},
      onFrequency, onBandwidth
    } = this.props;

    return (
        <Grid container spacing={2} direction="column">
          <Grid item>
            <FormantFreq i={i} frequency={frequency} onChange={onFrequency}/>
          </Grid>
          <Grid item>
            <FormantBand i={i} bandwidth={bandwidth} onChange={onBandwidth}/>
          </Grid>
        </Grid>
    );
  }

}

export default VTFormant;