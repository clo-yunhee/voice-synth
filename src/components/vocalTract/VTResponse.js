import React from 'react'
import {HorizontalGridLines, LineSeries, VerticalGridLines, XAxis, XYPlot, YAxis} from "react-vis";
import AppContext from "../../app/AppContext";

const minFreq = 100;
const maxFreq = 11000;
const plotWidth = 576;
const plotHeight = 360;
const color = ['orange', 'brown', 'green', 'red', 'magenta', 'black'];
const strokeWidth = [1, 1, 1, 1, 1, 1.25];

export const plotNbPoints = plotWidth;
export const frequencies = new Float32Array(plotNbPoints);

// Init with log10 scale.
const logMinFreq = Math.log10(minFreq);
const logMaxFreq = Math.log10(maxFreq);

for (let k = 0; k < plotNbPoints; ++k) {
  frequencies[k] = 10 ** (logMinFreq + (k * (logMaxFreq - logMinFreq)) / plotWidth);
}

function formatTickHz(f) {
  const log2 = Math.log10(2);
  const log4 = Math.log10(0.5);
  const logf = Math.log10(f);

  if (logf % 1 === 0
      || (log2 + logf) % 1 === 0
      || (log4 + logf) % 1 === 0) {

    if (f < 1000) {
      return f + " Hz";
    } else {
      return (f / 1000) + " kHz";
    }
  }
}

function formatTickDecibel(amp) {
  const gain = 20 * Math.log10(amp);

  if (gain % 20 === 0) {
    return gain + " dB";
  }
}

class VTResponse extends React.Component {

  static contextType = AppContext;

  render() {
    const {data} = this.props;

    return (
        <XYPlot
            width={plotWidth}
            height={plotHeight}
            xType="log"
            xDomain={[minFreq, maxFreq]}
            yType="log"
            yDomain={[10e-5, 10e1]}
            margin={{top: 30, left: 60, right: 20, bottom: 20}}
        >
          <HorizontalGridLines/>
          <VerticalGridLines/>
          <XAxis title="Frequency (Hz)" top={0} orientation="top" tickFormat={formatTickHz}/>
          <YAxis title="Gain (dB)" position="start" tickFormat={formatTickDecibel}/>
          <LineSeries
              stroke="orange"
              strokeWidth={1.3}
              data={data}
          />
        </XYPlot>
    )
  }

}

export default VTResponse;
