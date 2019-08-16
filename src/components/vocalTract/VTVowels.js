import React from 'react';
import {XAxis, XYPlot, YAxis} from "react-vis/es";
import MovableMark from './MovableMark';
import AppContext from "../../AppContext";

class VTVowels extends React.Component {

  static contextType = AppContext;

  static plotWidth = 300;
  static plotHeight = 300;

  static plotDomainF1 = [150, 1400];
  static plotTicksF1 = [150, 400, 800, 1200, 1400];

  static plotDomainF2 = [500, 4000];
  static plotTicksF2 = [500, 1000, 2000, 3000, 4000];

  constructor(props) {
    super(props);
    this.state = {
      dragging: false
    };
  }

  /*shouldComponentUpdate(nextProps, nextState, nextContext) {
    // Update if dragging status changed.
    if (this.state.dragging !== nextState.dragging)
      return true;

    const {formants} = this.props;

    // Update if formants weren't initialised before or not enough formants.
    if (formants === undefined || formants.length < 2) {
      return true;
    }

    // Optimisation: only update if dF1 > 100 & dF2 > 200.
    const [{frequency: F1}, {frequency: F2}] = formants;
    const [{frequency: nextF1}, {frequency: nextF2}] = nextProps.formants;

    return (Math.abs(F1 - nextF1) > 100 && Math.abs(F2 - nextF2) > 200);
  }*/

  onDrag = ({x: F1, y: F2}) => {
    const {onChange} = this.props;
    this.setState({dragging: true});
    if (onChange) {
      onChange(F1, F2);
    }
  };

  onDragEnd = ({x: F1, y: F2}) => {
    const {onChange} = this.props;
    this.setState({dragging: false});
    if (onChange) {
      onChange(F1, F2);
    }
  };

  render() {
    const {formants: [{frequency: F1}, {frequency: F2}]} = this.props;

    return (
        <XYPlot
            animation
            width={VTVowels.plotWidth}
            height={VTVowels.plotHeight}
            xDomain={VTVowels.plotDomainF1}
            yDomain={VTVowels.plotDomainF2}
            margin={{top: 10, left: 40, right: 20, bottom: 40}}
        >
          <XAxis title="F1 (Hz)" tickValues={VTVowels.plotTicksF1}/>
          <YAxis title="F2 (Hz)" tickValues={VTVowels.plotTicksF2}/>

          <MovableMark
              opacity={0.75}
              stroke="orange"
              fill="red"
              data={[{x: F1, y: F2}]}
              radius={6}
              onDrag={this.onDrag}
              onDragEnd={this.onDragEnd}
          />
        </XYPlot>
    );
  }

}

export default VTVowels;