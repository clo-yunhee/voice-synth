import React from 'react';
import PropTypes from 'prop-types';
import {AbstractSeries} from 'react-vis';
import {getAttributeScale} from 'react-vis/es/utils/scales-utils';

function getLocs(evt) {
  const xLoc = evt.type === 'touchstart' ? evt.pageX : evt.offsetX;
  const yLoc = evt.type === 'touchstart' ? evt.pageY : evt.offsetY;
  return {xLoc, yLoc};
}

class MovableMark extends AbstractSeries {

  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
    };
  }

  _coord2plot({x, y}) {
    const xScale = getAttributeScale(this.props, 'x');
    const yScale = getAttributeScale(this.props, 'y');

    return {x: xScale.invert(x), y: yScale.invert(y)};
  }

  _plot2coord({x, y}) {
    const xScale = getAttributeScale(this.props, 'x');
    const yScale = getAttributeScale(this.props, 'y');

    return {x: xScale(x), y: yScale(y)};
  }

  startDragging(event) {
    const {onDrag} = this.props;
    const {xLoc: x, yLoc: y} = getLocs(event.nativeEvent);

    this.setState({
      dragging: true
    });

    if (onDrag) {
      onDrag(this._coord2plot({x, y}));
    }
  }

  stopDragging(event) {
    const {dragging} = this.state;
    if (!dragging) {
      return;
    }
    const {onDragEnd} = this.props;
    const {xLoc: x, yLoc: y} = getLocs(event.nativeEvent);

    this.setState({
      dragging: false
    });

    if (onDragEnd) {
      onDragEnd(this._coord2plot({x, y}));
    }
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
      data: [d],
      radius,
      stroke,
      fill,
      opacity,
      className,
      innerWidth,
      innerHeight,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom
    } = this.props;

    const plotWidth = marginLeft + marginRight + innerWidth;
    const plotHeight = marginTop + marginBottom + innerHeight;

    const {x, y} = this._plot2coord(d);

    return (
        <g className={`${className} movablemark-container`}>
          <rect
              fill="black"
              opacity="0"
              x="0"
              y="0"
              width={Math.max(plotWidth, 0)}
              height={Math.max(plotHeight, 0)}
              onMouseDown={e => this.startDragging(e)}
              onMouseMove={e => this.onDrag(e)}
              onMouseUp={e => this.stopDragging(e)}
              onMouseLeave={e => this.stopDragging(e)}
              // preventDefault() so that mouse event emulation does not happen
              onTouchEnd={e => {
                e.preventDefault();
                this.stopDragging(e);
              }}
              onTouchCancel={e => {
                e.preventDefault();
                this.stopDragging(e);
              }}
              onContextMenu={e => e.preventDefault()}
              onContextMenuCapture={e => e.preventDefault()}
          />
          <circle
              pointerEvents="none"
              opacity={opacity}
              stroke={stroke}
              fill={fill}
              cx={x}
              cy={y}
              r={radius}
          />
        </g>
    );
  }

}

MovableMark.displayName = 'MovableMark';
MovableMark.propTypes = {
  ...AbstractSeries.propTypes,
  data: PropTypes.array,
  radius: PropTypes.number,
  stroke: PropTypes.string,
  fill: PropTypes.string,
  onDrag: PropTypes.func,
  onDragEnd: PropTypes.func,
};
MovableMark.defaultProps = {
  ...AbstractSeries.defaultProps,
  data: [{x: 0, y: 0}],
  radius: 2,
  stroke: 'orange',
  fill: 'red',
  onDrag: () => {
  },
  onDragEnd: () => {
  },
};

export default MovableMark;