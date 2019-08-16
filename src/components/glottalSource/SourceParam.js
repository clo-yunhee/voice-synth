import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import React from "react";

class SourceParam extends React.PureComponent {

  onChange = (evt) => {
    const value = Number(evt.target.value);

    this.props.onChange(this.props.name, value);
  };

  render() {
    const {name, value, min, max} = this.props;

    return (
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <InputLabel>
              {name} =
            </InputLabel>
          </Grid>
          <Grid item>
            <TextField
                type="number"
                inputProps={{min, max, step: 0.01}}
                onChange={this.onChange}
                value={value}
            />
          </Grid>
        </Grid>
    );
  }

}

export default SourceParam;