import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import React from "react";

class GlottalSourcePlot extends React.PureComponent {

  static nbPoints = 256;

  getInitialState() {
    return {
      sourceWave: this._getWavePath()
    };
  }

  _getWavePath = () => {
    const height = GlottalSourcePlot.nbPoints * 9 / 16;

    const [xStart, xStep] = [4, 1];
    const [yStart, yStep] = [height - 4, height - 8];

    const d = [`M ${xStart} ${yStart}`];
    const d2 = new Array(GlottalSourcePlot.nbPoints);

    const yData = this.synth.getSource().getArray(GlottalSourcePlot.nbPoints);

    for (let i = 0; i < GlottalSourcePlot.nbPoints; ++i) {
      const xNext = xStart + i * xStep;
      const yNext = yStart - yData[i] * yStep;

      d2[i] = `L ${xNext} ${yNext}`;
    }

    return d.concat(d2).join(" ");
  };

  _setStateSourceWave() {
    this.setState({ sourceWave: this._getWavePath() });
  };

  render() {
    return (
        <Paper className="glottal-flow-container">
          <Grid container spacing={2} direction="column" alignItems="flex-start">
            <Grid item>
              <Typography variant="subtitle2">
                Glottal flow waveshape
              </Typography>
            </Grid>
            <Grid item>
              <svg
                  width={GlottalSourcePlot.nbPoints}
                  height={GlottalSourcePlot.nbPoints * 9/16}

                  className="glottal-flow-svg"
              >
                <path d={this.state.sourceWave}
                      stroke="orange"
                      strokeWidth={2}
                      fill="none"
                />
              </svg>
            </Grid>
          </Grid>
        </Paper>
    );
  }

}

export default GlottalSourcePlot;