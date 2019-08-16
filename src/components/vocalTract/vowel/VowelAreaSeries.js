import React from 'react';
import PropTypes from 'prop-types';
import {AbstractSeries} from 'react-vis';
import {getAttributeScale} from 'react-vis/es/utils/scales-utils';

function getLocs(evt) {
  const xLoc = evt.type === 'touchstart' ? evt.pageX : evt.offsetX;
  const yLoc = evt.type === 'touchstart' ? evt.pageY : evt.offsetY;
  return {xLoc, yLoc};
}

class VowelAreaSeries extends AbstractSeries {

  constructor(props) {
    super(props);
    this.state = {
      hovering: [],
    };
  }

  _coord2plot({x, y}) {
    const {marginLeft, marginTop} = this.props;

    const xScale = getAttributeScale(this.props, 'x');
    const yScale = getAttributeScale(this.props, 'y');

    return {x: xScale.invert(x - marginLeft), y: yScale.invert(y - marginTop)};
  }

  _plot2coord({x, y}) {
    const {marginLeft, marginTop} = this.props;

    const xScale = getAttributeScale(this.props, 'x');
    const yScale = getAttributeScale(this.props, 'y');

    return {x: xScale(x) + marginLeft, y: yScale(y) + marginTop};
  }

  onDrag(event) {
    const {onDrag} = this.props;
    const {dragging} = this.state;
    const {xLoc: x, yLoc: y} = getLocs(event.nativeEvent);

    if (dragging && onDrag) {
      onDrag(this._coord2plot({x, y}));
    }
  }

  render() {
    const {
      stdF1, stdF2,
      data, className
    } = this.props;

    // 95% band
    const xScale = getAttributeScale(this.props, 'x');
    const yScale = getAttributeScale(this.props, 'y');

    return (
        <g className={className}>
          {
            data.map(({vowel, F1, F2}) => {
              const {x, y} = this._plot2coord({x: F2, y: F1});

              return (
                  <React.Fragment key={vowel}>
                    <ellipse
                        pointerEvents="none"
                        stroke="black"
                        strokeWidth={1}
                        fill="grey"
                        fillOpacity={0.5}
                        cx={x}
                        cy={y}
                        rx={10}
                        ry={10}
                    />
                    <text x={x} y={y} dominantBaseline="middle" textAnchor="middle" fontSize="0.8em">
                      {vowel}
                    </text>
                  </React.Fragment>
              );
            })
          }
        </g>
    );
  }

}

VowelAreaSeries.displayName = 'MovableMark';
VowelAreaSeries.propTypes = {
  ...AbstractSeries.propTypes,
  data: PropTypes.array,
  radius: PropTypes.number,
  stroke: PropTypes.string,
  fill: PropTypes.string,
  onHover: PropTypes.func,
  onDragEnd: PropTypes.func,
};
VowelAreaSeries.defaultProps = {
  ...AbstractSeries.defaultProps,
  data: [{x: 150, y: 500}],
  radius: 2,
  stroke: 'orange',
  fill: 'red',
  onDrag: () => {
  },
  onDragEnd: () => {
  },
};

export default VowelAreaSeries;