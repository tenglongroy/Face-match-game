import React, { useState, useEffect, useRef } from "react";
import clsx from 'clsx';
import { makeStyles, ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReplayIcon from '@material-ui/icons/Replay';
import {roundDecimal} from '../util';
import Tile from "./Tile";
import LoadingDialog from './LoadingDialog';
//import {apiConfig} from '../config';  ???

const apiConfig = require('../config').apiConfig;
const axios = require('axios').default;



const useStyles = makeStyles(theme => ({
    fullScreenRoot: {
        
    },
    loadingBackdrop: {

    },
    root: {
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
    },
    progressRow: {
        display: "flex",
        flexWrap: "wrap",
        flexGrow: 1
    },
    progressBar: {
        flexBasis: "100%",
        margin: theme.spacing(2),
    },
    rowRoot: {
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "column",
    },
    columnRoot: {
        display: "flex",
        flexDirection: "row",
    },
    flipped: {

    },
    dialog: {
        display: "flex",
        flexDirection: "column",
    },
    replayRow: {
        display: "flex",
        flexBasis: "100%",
        justifyContent: "flex-end",
        margin: "10px 0",
    }
}));

const theme = createMuiTheme({
    palette: {
        primary: { main: green[500], contrastText: "#fff" },
    },
});


export default function Board(props){
    const classes = useStyles(props);

    /* const [rows, setRows] = useState(props.rows || 4);
    const [columns, setColumns] = useState(props.columns || 6); */
    const [size, setSize] = useState(props.size || {
        row: 4,
        column: 6
    });
    const [imageList, setImageList] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [flipList, setFlipList] = useState([]);
    const [matchList, setMatchList] = useState([]);
    const [flipProgress, setFlipProgress] = useState(1);
    //const [preloadProgress, setPreloadProgress] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dimensionSelected, setDimensionSelected] = useState(false);

    let firstFlip = useRef(undefined);
    let secondFlip = useRef(undefined);
    //let preloadProgress = useRef(0);

    //get actual image url from random url
    useEffect(()=>{
        dimensionSelected && init();
    }, [size]);

    useEffect(()=>{
        //if matchList changed, that means the board will start over
        if(!isLoading){

        }
    }, [matchList]);

    useEffect(()=>{
        if(flipList.length > 0 && firstFlip.current !== undefined && secondFlip.current !== undefined){
            if(matchList[firstFlip.current] === matchList[secondFlip.current]){  //if two flipped tiles are a match
                setFlipProgress(roundDecimal(100 * flipList.filter(item => item).length / flipList.length, 1));
                //finish the game
                if(flipList.filter(item => item).length === flipList.length){
                    setTimeout(()=>{
                        setDialogOpen(true);
                    }, 500);
                }
            }
            else{   //if not match, wait half second then flip both tiles back, and set firstFlip and secondFlip to undefined
                let first = firstFlip.current, second = secondFlip.current;
                setTimeout(()=>{
                    setFlipList(prevState => {
                        let newState = prevState.slice();
                        newState[first] = newState[second] = false;
                        return newState;
                    });
                }, 500);
            }
            firstFlip.current = secondFlip.current = undefined;
        }
    }, [flipList]);

    const init = () =>{
        let total = Math.ceil(size.row * size.column / 2);
        let urlList = Array.apply(null, Array(total)).map((item, index) => { return apiConfig.baseUrl+"?random="+(index+1) });
        let count = 0;
        let imagePromiseList = urlList.map(url => 
            axios.get(url)/* .then(promise => {
                console.log('preload +1');
                count += 1;
                setPreloadProgress(100 * count / urlList.length);
                return promise;
            }) */
        );
        axios.all(imagePromiseList).then( promises =>{
            let imageURLList = promises.map(item => item.request.responseURL);
            console.log("imageURLList ", imageURLList.sort());
            console.log("duplicate imageURLList ", findRepeat(imageURLList));
            setImageList(imageURLList);
            let blobPromiseList = imageURLList.map((url, index) => axios.get(url, {
                    responseType: 'blob'
                })
            );
            //generate a shuffled index list for generating the tiles, and a flip list default with false
            axios.all(blobPromiseList).then(()=>{
                let indexList = shuffleGenerate(imageURLList);
                setMatchList(indexList);
                setFlipList(new Array(indexList.length).fill(false));
                setTimeout(()=>{
                    setLoading(false);
                }, 0);                
            });
        });
    }

    const handleClick = (event, props) =>{
        console.log(props.index);
        let index = parseInt(event.currentTarget.getAttribute('index'));
        //if the clicked tile is already flip, do nothing.
        if(flipList[index]){
            console.log("tile "+index+" has already been successfully flipped");
            return;
        }

        setFlipList(prevState => {
            let newState = prevState.slice();
            newState[index] = true;
            return newState;
        });

        if(firstFlip.current === undefined){
            firstFlip.current = index;
        }
        else if(secondFlip.current === undefined){
            secondFlip.current = index;
        }
    }

    const handleCloseDialog = () =>{
        setDialogOpen(false);
    }

    const handleReplay = () =>{
        firstFlip.current = secondFlip.current = undefined;
        setDialogOpen(false);
        setDimensionSelected(false);
        //setLoading(true);
        setFlipList([]);
        setImageList([]);
        setMatchList([]);
        setFlipProgress(1);
        //init();
        
    }

    const finishInit = (challenge, size) =>{
        if(challenge){
            //for korean face
        }
        else{
            const sizeList = size.split('x');
            setDimensionSelected(true);
            setLoading(true);
            setSize({
                row: parseInt(sizeList[0]),
                column: parseInt(sizeList[1]) 
            });
            /* setRows(parseInt(sizeList[0]));
            setColumns(parseInt(sizeList[1])); */
        }
    }


    return(
        <div className={classes.fullScreenRoot}>
            {!dimensionSelected && (
                <LoadingDialog dimensionSelected={dimensionSelected} finishInit={finishInit} />
            )}
            {isLoading && (
            <Backdrop className={classes.loadingBackdrop} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            )}
        
            {dimensionSelected && !isLoading && (
            <div className={classes.root}>
                <div className={classes.progressRow}>
                    <Typography variant="h6" gutterBottom>Completion {flipProgress === 1 ? 0 : flipProgress}%</Typography>
                    <LinearProgress className={classes.progressBar} variant="determinate" value={flipProgress} />
                </div>
                <div className={classes.replayRow}>
                    <ThemeProvider theme={theme}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleReplay}
                            className={classes.button}
                            endIcon={<ReplayIcon />}
                        >
                            Replay
                        </Button>
                    </ThemeProvider>
                </div>
                <div className={clsx(classes.rowRoot)}>
                    {chunk(matchList, size.column).map((arr, index)=>
                        <div key={"row"+index} className={clsx(classes.columnRoot)}>
                            {arr.map((match, ind) => {
                                let trueIndex = index * size.column + ind;
                                return (
                                    <Tile key={"column"+trueIndex} index={trueIndex} flip={flipList[trueIndex]} columns={size.column} url={imageList[match]} onClick={handleClick} />
                                )
                            })}
                        </div>
                    )}
                </div>

                {dialogOpen && (
                    <Dialog
                        className={classes.dialog}
                        open={dialogOpen}
                        onClose={handleCloseDialog}
                        aria-labelledby="finish-dialog"
                    >
                        <DialogTitle id="finish-dialog">Congratulations!</DialogTitle>
                        <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            You have finished the game. Do you like to play again?
                        </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">
                            No
                        </Button>
                        <Button onClick={handleReplay} color="primary" autoFocus>
                            Yes
                        </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </div>
            )}
        </div>
    )
}



function findRepeat(arr){
    var uniq = arr.map((item) => {
        return {
        count: 1,
        name: item
        }
    }).reduce((a, b) => {
        a[b.name] = (a[b.name] || 0) + b.count
        return a
    }, {})

    return Object.keys(uniq).filter((a) => uniq[a] > 1);
}


function chunk(arr, chunkSize) {
    var result = [];
    for (var i = 0; i < arr.length; i += chunkSize)
        result.push(arr.slice(i, i + chunkSize));
    return result;
}

function shuffleGenerate(urlList){
    let length = urlList.length;
    if(length){
        let indexList = [];
        let i = 0;
        while(i < length){
            indexList = indexList.concat([i, i]);
            i += 1;
        }
        return shuffle(indexList);
    }
    else
        return undefined;
}
//https://stackoverflow.com/questions/18806210/generating-non-repeating-random-numbers-in-js
function shuffle(array) {
    var i = array.length,
        j = 0,
        temp;

    while (i--) {
        j = Math.floor(Math.random() * (i+1));
        // swap randomly chosen element with current element
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}





/**
 * Load an image from a given URL
 * @param {String} url The URL of the image resource
 * @returns {Promise<Image>} The loaded image
 */
function loadImage(url) {
    /*
     * We are going to return a Promise which, when we .then
     * will give us an Image that should be fully loaded
     */
    return new Promise(resolve => {
      /*
       * Create the image that we are going to use to
       * to hold the resource
       */
      const image = new Image();
      /*
       * The Image API deals in even listeners and callbacks
       * we attach a listener for the "load" event which fires
       * when the Image has finished the network request and
       * populated the Image with data
       */
      image.addEventListener('load', () => {
        /*
         * You have to manually tell the Promise that you are
         * done dealing with asynchronous stuff and you are ready
         * for it to give anything that attached a callback
         * through .then a realized value.  We do that by calling
         * resolve and passing it the realized value
         */
        resolve(image);
      });
      /*
       * Setting the Image.src is what starts the networking process
       * to populate an image.  After you set it, the browser fires
       * a request to get the resource.  We attached a load listener
       * which will be called once the request finishes and we have
       * image data
       */
      image.src = url;
    });
  }