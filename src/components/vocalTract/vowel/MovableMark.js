import React from 'react';
import PropTypes from 'prop-types';
import {AbstractSeries} from 'react-vis';
import {getAttributeScale} from 'react-vis/es/utils/scales-utils';

function getLocs(evt) {
  const {nativeEvent} = evt;

  if (evt.type.startsWith("touch")) {
    const rect = evt.target.getBoundingClientRect();
    return {
      xLoc: evt.touches[0].clientX - rect.left,
      yLoc: evt.touches[0].clientY - rect.top
    };
  } else {
    return {
      xLoc: nativeEvent.offsetX,
      yLoc: nativeEvent.offsetY
    };
  }
}

class MovableMark extends AbstractSeries {

  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
    };
  }

  componentDidMount() {
    let supportsPassiveOption = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: () => {
          supportsPassiveOption = true;
        }
      });
      const noop = function () {
      };
      window.addEventListener('testPassiveEventSupport', noop, opts);
      window.removeEventListener('testPassiveEventSupport', noop, opts);
    } catch (e) {
    }

    window.addEventListener('touchmove', this.onTouchMove,
        supportsPassiveOption ? {passive: false, capture: false} : false);

  }

  componentWillUnmount() {
    window.removeEventListener('touchstart', this.onTouchMove);
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

  startDragging(event) {
    const {onDrag} = this.props;
    const {xLoc: x, yLoc: y} = getLocs(event);

    this.setState({
      dragging: true
    });

    if (onDrag) {
      onDrag(this._coord2plot({x, y}));
    }
  }

  stopDragging() {
    const {dragging} = this.state;
    if (!dragging) {
      return;
    }

    this.setState({
      dragging: false
    });
  }

  onDrag(event) {
    const {onDrag} = this.props;
    const {dragging} = this.state;
    const {xLoc: x, yLoc: y} = getLocs(event);

    if (dragging && onDrag) {
      onDrag(this._coord2plot({x, y}));
    }
  }

  onTouchMove(evt) {
    if (!this.state.dragging || evt.defaultPrevented) {
      return;
    }

    evt.preventDefault();
    this.onDrag(evt);
  }

  render() {
    const {
      data: [d],
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
        <g className={className}>
          <rect
              className="vt-vowels-rect"
              fill="black"
              opacity="0"
              x="0"
              y="0"
              width={Math.max(plotWidth, 0)}
              height={Math.max(plotHeight, 0)}

              ref={r => this.rect = r}

              onMouseDown={e => this.startDragging(e)}
              onTouchStart={e => this.startDragging(e)}

              onMouseMove={e => this.onDrag(e)}

              onMouseUp={e => this.stopDragging(e)}
              onTouchEnd={e => this.stopDragging(e)}

              onMouseLeave={e => this.stopDragging(e)}
              onTouchCancel={e => this.stopDragging(e)}

              onContextMenu={e => e.preventDefault()}
              onContextMenuCapture={e => e.preventDefault()}
          />
          <circle
              className="vt-vowels-circle"
              pointerEvents="none"
              stroke="orange"
              strokeOpacity={1}
              fill="red"
              fillOpacity={opacity}
              cx={x}
              cy={y}
              r={6}
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
};
MovableMark.defaultProps = {
  ...AbstractSeries.defaultProps,
  data: [{x: 150, y: 500}],
  radius: 2,
  stroke: 'orange',
  fill: 'red',
  onDrag: () => {
  },
};

export default MovableMark;