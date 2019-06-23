import reactLogo from "../reactLogo.svg";
import muiLogo from "../muiLogo.svg";
import Grid from '@material-ui/core/Grid'
import React from "react";
import Typography from "@material-ui/core/Typography";

class Footer extends React.PureComponent {

  render() {
    return (
        <footer className="App-footer">
          <Grid container direction="row" alignItems="center" justify="space-between">
            <Grid item className="source-link-container">
              <Typography variant="body1">
                <span>Source code available on </span>
                <a
                    className="App-link"
                    href="https://github.com/ichi-rika/voice-synth"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <span>. Licensed under MIT License.</span>
              </Typography>
            </Grid>
            <Grid item>
              <Grid container spacing={1} direction="row" alignItems="center" justify="center">
                <Grid item>
                  <img src={reactLogo} className="App-react-logo" alt="React logo"/>
                </Grid>
                <Grid item>
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
                </Grid>
                <Grid item>
                  <img src={muiLogo} className="App-mui-logo" alt="Material-UI logo"/>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </footer>
    )
  }

}

export default Footer