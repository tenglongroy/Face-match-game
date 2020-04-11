import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';


const useStyles = makeStyles((theme) => ({
    form: {
      display: 'flex',
      flexDirection: 'column',
      margin: 'auto',
    },
    formControl: {
      marginTop: theme.spacing(2),
      minWidth: 120,
    },
    formControlLabel: {
      marginTop: theme.spacing(1),
      marginRight: "auto",
    },
}));


export default function LoadingDialog(props){
    const classes = useStyles();
    const [size, setSize] = useState("");
    const [challenge, setChallenge] = useState(false);

    const handleSubmit = () =>{
        (challenge || size.length) && props.finishInit(challenge, size);
    }
    const handleSizeChange = (event) =>{
        const {name, value} = event.target;
        setSize(value);
    }
    const handleChallenge = (event) =>{
        setChallenge(event.target.checked);
    }


    return (
        <Dialog
            fullWidth={true}
            maxWidth="sm"
            open={!props.dimensionSelected}
            aria-labelledby="loading-dialog-title"
            disableBackdropClick
        >
            <DialogTitle id="loading-dialog-title">Choose dimension for the board</DialogTitle>
            <DialogContent>
            <DialogContentText>
                You can choose the size for the game board.
            </DialogContentText>
            <form className={classes.form} noValidate >
                <FormControl className={classes.formControl} disabled={challenge}>
                    <InputLabel htmlFor="max-width">Game Board Dimension</InputLabel>
                    <Select
                        value={size}
                        onChange={handleSizeChange}
                    >
                        <MenuItem value="2x3">2 x 3</MenuItem>
                        <MenuItem value="3x4">3 x 4</MenuItem>
                        <MenuItem value="4x6">4 x 6</MenuItem>
                        <MenuItem value="6x6">6 x 6</MenuItem>
                        <MenuItem value="6x8">6 x 8</MenuItem>
                        <MenuItem value="8x8">8 x 8</MenuItem>
                        <MenuItem value="8x10">8 x 10</MenuItem>
                        <MenuItem value="10x12">10 x 12</MenuItem>
                    </Select>
                    </FormControl>
                <FormControlLabel
                className={classes.formControlLabel}
                control={<Switch checked={challenge} onChange={handleChallenge} />}
                label="Challenge!"
                />
            </form>
            </DialogContent>
            <DialogActions>
            <Button type="submit" color="primary" onClick={handleSubmit}>
                Confirm
            </Button>
            </DialogActions>
        </Dialog>
    )
}