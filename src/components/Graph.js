import React from 'react'

class Graph extends React.Component {

  render() {
    const {width, height, children} = this.props;

    const childProps = {width, height};

    let elements = React.Children.toArray(children);

    if (elements.length === 1) {
      elements = React.cloneElement(elements[0], childProps)
    } else if (elements.length > 0) {
      const lastElement = elements[elements.length - 1];
      elements =
          [React.cloneElement(elements[0], childProps)]
              .concat(elements.slice(1, -1))
              .concat(React.cloneElement(lastElement, childProps))
    }

    return (
        <svg
            width={this.props.width}
            height={this.props.height}
            className={this.props.className}
        >
          {elements}
        </svg>
    )
  }

}

export default Graph;