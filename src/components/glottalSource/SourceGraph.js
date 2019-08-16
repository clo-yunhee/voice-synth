import React from "react";
import AppContext from "../../AppContext";
import Grid from "@material-ui/core/Grid";
import {HorizontalGridLines, LineSeries, VerticalGridLines, XAxis, XYPlot, YAxis} from "react-vis";

const plotWidth = 320;
const plotHeight = 240;
const color = 'orange';
const strokeWidth = 1.25;

export const plotNbPoints = plotWidth;


function formatTickTime(t) {
  if (t === 0) return 0;
  if (t === 1) return "T0";
  return t + " T0";
}

function formatTickAmplitude(amp) {
  if (10 * amp % 4 === 0) {
    return amp;
  }
}

class SourceGraph extends React.Component {

  static contextType = AppContext;

  render() {
    const {data} = this.props;

    return (
        <Grid item>
          <XYPlot
              width={plotWidth}
              height={plotHeight}
              xDomain={[0, 1]}
              yDomain={[0, 1]}
          >
            <HorizontalGridLines/>
            <VerticalGridLines/>
            <XAxis title="Time" tickFormat={formatTickTime}/>
            <YAxis title="Amplitude" tickFormat={formatTickAmplitude}/>
            <LineSeries
                key="glottal-flow-svg"
                stroke={color}
                strokeWidth={strokeWidth}
                data={data}
            />
          </XYPlot>
        </Grid>
    )
  }

}

export default SourceGraph;


