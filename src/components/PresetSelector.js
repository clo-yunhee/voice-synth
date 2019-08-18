import React from "react";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Slider from "@material-ui/core/Slider";
import Typography from "@material-ui/core/Typography";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import AppContext from "../AppContext"
import {defaultPreset, getPreset, vowels} from "../presets";

function valueDisplayFormat(value) {
  return `${Math.round(100 * value)}%`
}

class PresetSelector extends React.Component {

  static contextType = AppContext;

  constructor(props, context) {
    super(props);
    this.state = {
      gender: defaultPreset.gender,
      color: defaultPreset.color,
      vowel: defaultPreset.vowel
    };

    context.subscribeEvent('preset', this.handlePreset);
  }

  onGender = (event, gender) => {
    this.onPresetChange({gender: ['M', 'F'][gender]});
  };

  onColor = (event, color) => {
    this.onPresetChange({color})
  };

  onVowel = (event, vowel) => {
    this.onPresetChange({vowel})
  };

  onPresetChange = (newSet) => {
    const presetParams = {...this.state, ...newSet};

    const preset = getPreset(presetParams);
    this.context.onPreset(preset);
  };

  handlePreset = ({preset}) => {
    const {gender, color, vowel} = preset;
    this.setState({gender, color, vowel});
  };

  render() {
    const {gender: assignedGender, color, vowel} = this.state;

    const gender = {'M': 0, 'F': 1}[assignedGender];

    return (
        <>
          <Box className="preset-selector" boxShadow={1} bgcolor="lightgrey">
            <Grid container spacing={2} direction="row" justify="center" alignItems="center">
              <Grid item>
                <Typography variant="h6">
                  Preset selection
                </Typography>
              </Grid>
              <Grid item>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Assigned gender</FormLabel>
                  <Slider
                      min={0}
                      max={1}
                      step={null}
                      marks={[
                        {value: 0, label: 'Male'},
                        {value: 1, label: 'Female'}
                      ]}
                      value={gender}
                      onChangeCommitted={this.onGender}
                  />
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Gender expression</FormLabel>
                  <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      valueLabelFormat={valueDisplayFormat}
                      valueLabelDisplay="auto"
                      marks={[
                        {value: 0, label: 'Masculine'},
                        {value: 0.5, label: 'Neutral'},
                        {value: 1, label: 'Feminine'}
                      ]}
                      value={color}
                      onChangeCommitted={this.onColor}
                  />
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Vowel</FormLabel>
                  <ToggleButtonGroup
                      exclusive
                      value={vowel}
                      onChange={this.onVowel}
                  >
                    {
                      vowels.map(v => (
                          <ToggleButton
                              key={v}
                              value={v}
                          >
                            <Typography className="preset-selector-vowel">
                              {v}
                            </Typography>
                          </ToggleButton>
                      ))
                    }
                  </ToggleButtonGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </>
    );
  }

}

export default PresetSelector