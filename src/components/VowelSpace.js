import React from 'react';
import {XAxis, XYPlot, YAxis} from "react-vis/es";
import MovableMark from './MovableMark';

class VowelSpace extends React.PureComponent {

  static plotWidth = 300;
  static plotHeight = 300;

  static plotDomainF1 = [150, 1400];
  static plotTicksF1 = [150, 400, 800, 1200, 1400];

  static plotDomainF2 = [500, 4000];
  static plotTicksF2 = [500, 1000, 2000, 3000, 4000];

  constructor(props) {
    super(props);
    this.state = this.getSyncState();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props !== prevProps) {
      this.setState(this.getSyncState());
    }
  }

  getSyncState() {
    return {
      formants: this.props.formants
    }
  }

  onDrag = ({x: F1, y: F2}) => {
    const {onChange} = this.props;
    if (onChange) {
      onChange({F1, F2});
    }
  };

  onDragEnd = ({x: F1, y: F2}) => {
    const {onChange} = this.props;
    if (onChange) {
      onChange({F1, F2});
    }
  };

  render() {
    return (
        <XYPlot
            width={VowelSpace.plotWidth}
            height={VowelSpace.plotHeight}
            xDomain={VowelSpace.plotDomainF1}
            yDomain={VowelSpace.plotDomainF2}
        >
          <MovableMark
              opacity={0.75}
              stroke="orange"
              fill="red"
              data={[{x: this.state.formants[0], y: this.state.formants[1]}]}
              radius={6}
              onDrag={this.onDrag}
              onDragEnd={this.onDragEnd}
          />

          <XAxis title="F1 (Hz)" tickValues={VowelSpace.plotTicksF1}/>
          <YAxis title="F2 (Hz)" tickValues={VowelSpace.plotTicksF2}/>
        </XYPlot>
    );
  }

}

export default VowelSpace;