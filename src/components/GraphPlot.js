import React from "react";

class GraphPlot extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      path: this._calculatePath()
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props !== prevProps) {
      this.setState({
        path: this._calculatePath()
      });
    }
  }

  _calculatePath() {
    const {height, data} = this.props;

    const [xStart, xStep] = [4, .5];
    const [yStart, yStep] = [height / 2 - 4, height / 2 - 8];

    const d = [`M ${xStart} ${yStart}`];
    const d2 = new Array(data.length);
    const d3 = new Array(data.length);

    for (let i = 0; i < data.length; ++i) {
      const xNext = xStart + i * xStep;
      const yNext = yStart - data[i] * yStep;

      d2[i] = `L ${xNext} ${yNext}`;
      d3[i] = `L ${xStart + data.length * xStep + xNext} ${yNext}`
    }

    return d.concat(d2).concat(d3).join(" ");
  }

  render() {
    return (
        <path
            d={this.state.path}
            stroke={this.props.color}
            strokeWidth={2}
            fill="none"
            {...this.props}
        />
    );
  }
}

export default GraphPlot;