import reactLogo from "../reactLogo.svg";
import muiLogo from "../muiLogo.svg";
import React from "react";

class Footer extends React.PureComponent {

  render() {
    return (
        <footer className="App-footer">
          <img src={reactLogo} className="App-react-logo" alt="React logo"/>
          <p>
            <span>Powered by </span>
            <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
              React
            </a>
            <span> and </span>
            <a
                className="App-link"
                href="https://material-ui.com"
                target="_blank"
                rel="noopener noreferrer"
            >
              Material-UI
            </a>
          </p>
          <img src={muiLogo} className="App-mui-logo" alt="Material-UI logo"/>
        </footer>
    )
  }

}

export default Footer