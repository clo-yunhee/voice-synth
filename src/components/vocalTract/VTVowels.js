import React from 'react';
import Grid from "@material-ui/core/Grid";
import {XAxis, XYPlot, YAxis} from "react-vis";
import MovableMark from './vowel/MovableMark';
import VowelSeries from './vowel/VowelSeries';
import AppContext from "../../app/AppContext";
import {getPreset, vowels} from '../../presets'
import FormLabel from "@material-ui/core/FormLabel";
import Slider from "@material-ui/core/Slider";

const plotWidth = 400;
const plotHeight = 300;

function plotTickLabel(f) {
  return f.toLocaleString();
}

// Construct vowel areas

const vowelAverages = {'M': {}, 'F': {}};

['M', 'F'].forEach(gender => {
  [0.0, 0.5, 1.0].forEach(color => {
    vowelAverages[gender][color] = vowels.map(vowel => {
      const {formants: {freqs: [F1, F2]}} = getPreset({gender, color, vowel});
      return {vowel, F1, F2};
    });
  });
});

const vowelSpaces = {
  'M': {
    F1: {
      ticks: [800, 700, 600, 500, 400, 300],
      domain: [900, 200]
    },
    F2: {
      ticks: [2200, 2000, 1800, 1600, 1400, 1200, 1000],
      domain: [2400, 900]
    }
  },
  'F': {
    F1: {
      ticks: [1000, 900, 800, 700, 600, 500, 400],
      domain: [1100, 300]
    },
    F2: {
      ticks: [2600, 2400, 2200, 2000, 1800, 1600, 1400],
      domain: [2800, 1200]
    }
  }
};

class VTVowels extends React.Component {

  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = {
      agab: 1, color: 0.5,
    };
  }

  onDrag = ({x: F2, y: F1}) => {
    const {onChange} = this.props;
    if (onChange) {
      onChange(F1, F2);
    }
  };

  onGender = (event, newValue) => {
    this.setState({agab: newValue});
  };

  onColor = (event, newValue) => {
    this.setState({color: newValue});
  };

  render() {
    const {formants: [{frequency: F1}, {frequency: F2}]} = this.props;
    const {agab, color} = this.state;

    const gender = ['M', 'F'][agab];

    const {F1: spaceF1, F2: spaceF2} = vowelSpaces[gender];

    return (
        <Grid container direction="row">
          <Grid item>
            <XYPlot
                className="vt-plot"
                width={plotWidth}
                height={plotHeight}
                xDomain={spaceF2.domain}
                xType="linear"
                yDomain={spaceF1.domain}
                yType="linear"
                margin={{top: 10, left: 40, right: 10, bottom: 30}}
            >
              <XAxis title="F2 (Hz)" tickValues={spaceF2.ticks} tickFormat={plotTickLabel}/>
              <YAxis title="F1 (Hz)" tickValues={spaceF1.ticks} tickFormat={plotTickLabel}/>

              <VowelSeries
                  data={vowelAverages[gender][color]}
              />

              <MovableMark
                  className="vt-vowels-mark"
                  opacity={0.75}
                  data={[{x: F2, y: F1}]}
                  onDrag={this.onDrag}
              />
            </XYPlot>
          </Grid>
          <Grid item>
            <Grid container spacing={2} direction="column" alignItems="stretch" className="vt-vowels-picker">
              <Grid item>
                <FormLabel component="legend">Assigned gender</FormLabel>
                <Slider
                    min={0}
                    max={1}
                    step={null}
                    marks={[
                      {value: 0, label: 'Male'},
                      {value: 1, label: 'Female'}
                    ]}
                    value={agab}
                    onChange={this.onGender}
                />
              </Grid>
              <Grid item>
                <FormLabel component="legend">Gender expression</FormLabel>
                <Slider
                    min={0}
                    max={1}
                    step={null}
                    marks={[
                      {value: 0, label: 'Masculine'},
                      {value: 0.5, label: 'Neutral'},
                      {value: 1, label: 'Feminine'}
                    ]}
                    value={color}
                    onChange={this.onColor}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
    );
  }

}

export default VTVowels;