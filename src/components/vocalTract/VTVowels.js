import React from 'react';
import {XAxis, XYPlot, YAxis} from "react-vis";
import MovableMark from './vowel/MovableMark';
import VowelAreaSeries from './vowel/VowelAreaSeries';
import AppContext from "../../AppContext";


const plotWidth = 576;
const plotHeight = 480;

const plotDomainF1 = [1200, 150];
const plotTicksF1 = [1200, 1000, 800, 600, 500, 400, 300, 200];

const plotDomainF2 = [3000, 500];
const plotTicksF2 = [3000, 2500, 2000, 1500, 1000, 500];

function plotTickLabel(f) {
  if (f < 1000) {
    return f + " Hz";
  } else {
    return (f / 1000) + " kHz";
  }
}

// Construct vowel areas
const stdF1 = 100;
const stdF2 = 150;

const vowelAreas = [
  {vowel: '/a/', F1: 800, F2: 1500},
  {vowel: '/e/', F1: 600, F2: 2000},
  {vowel: '/i/', F1: 350, F2: 2500},
  {vowel: '/o/', F1: 600, F2: 1000},
  {vowel: '/u/', F1: 350, F2: 800}
];

class VTVowels extends React.Component {

  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.state = {
      dragging: false
    };
  }

  onDrag = ({x: F2, y: F1}) => {
    const {onChange} = this.props;
    this.setState({dragging: true});
    if (onChange) {
      onChange(F1, F2);
    }
  };

  render() {
    const {formants: [{frequency: F1}, {frequency: F2}]} = this.props;

    return (
        <XYPlot
            className="vt-plot"
            width={plotWidth}
            height={plotHeight}
            xDomain={plotDomainF2}
            xType="log"
            yDomain={plotDomainF1}
            yType="log"
            margin={{top: 10, left: 60, right: 30, bottom: 30}}
        >
          <XAxis title="F2 (Hz)" tickValues={plotTicksF2} tickFormat={plotTickLabel}/>
          <YAxis title="F1 (Hz)" tickValues={plotTicksF1} tickFormat={plotTickLabel}/>

          <VowelAreaSeries
              stdF1={stdF1}
              stdF2={stdF2}
              data={vowelAreas}
          />

          <MovableMark
              className="vt-vowels-mark"
              opacity={0.75}
              stroke="orange"
              fill="red"
              data={[{x: F2, y: F1}]}
              radius={6}
              onDrag={this.onDrag}
          />
        </XYPlot>
    );
  }

}

export default VTVowels;