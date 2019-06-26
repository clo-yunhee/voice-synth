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
    const [yStart, yStep] = [height - 4, height - 8];

    const d = [`M ${xStart} ${yStart - data[0] * yStep}`];
    const d2 = new Array(data.length);

    for (let i = 0; i < data.length; ++i) {
      const xNext = xStart + i * xStep;
      const yNext = yStart - data[i] * yStep;

      d2[i] = `L ${xNext} ${yNext}`;
    }

    return d.concat(d2).join(" ");
  }

  render() {
    return (
        <path
            d={this.state.path}
            stroke={this.props.color || "orange"}
            strokeWidth={this.props.strokeWidth || 2}
            fill="none"
            {...this.props}
        />
    );
  }
}

export default GraphPlot;