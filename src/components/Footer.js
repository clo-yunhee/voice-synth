import reactLogo from "../reactLogo.svg";
import muiLogo from "../muiLogo.svg";
import Grid from '@material-ui/core/Grid'
import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

class Footer extends React.PureComponent {

  render() {
    return (
        <footer className="App-footer">
          <Grid container direction="row" alignItems="center" justify="space-between">
            <Grid item className="source-link-container">
              <Grid container direction="column" alignItems="flex-start">
                <Grid item>
                  <Typography variant="body1">
                    <span>Made by Clo Yun-Hee Dufour. </span>
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    <span>Source code available on </span>
                    <a
                        className="github-link"
                        href="https://github.com/ichi-rika/voice-synth"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                    <span>. Licensed under MIT License.</span>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container spacing={1} direction="row" alignItems="center" justify="center">
                <Grid item>
                  <a
                      className="github-link"
                      href="https://reactjs.org"
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                    <img src={reactLogo} className="App-react-logo" alt="React logo"/>
                  </a>
                </Grid>
                <Grid item>
                  <a
                      href="https://material-ui.com"
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                    <img src={muiLogo} className="App-mui-logo" alt="Material-UI logo"/>
                  </a>
                </Grid>
                <Grid item>
                  <Button
                      variant="contained"
                      color="primary"
                      href="https://paypal.me/ChloeRika"
                  >
                    Donate
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </footer>
    )
  }

}

export default Footer