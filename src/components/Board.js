import React, { useState, useEffect, useRef, useCallback } from "react";
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
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import {roundDecimal} from '../util';
import Tile from "./Tile";
import LoadingDialog from './LoadingDialog';
import StopWatch from './StopWatch';
import { useTheme } from '@material-ui/core/styles';
import AnnouncementBar from "./AnnouncementBar";
//import {apiConfig} from '../config';  ???

const {apiConfig, challengeMapping} = require('../config');
const axios = require('axios').default;



const useStyles = makeStyles(theme => ({
    fullScreenRoot: {
        
    },
    loadingBackdrop: {
        zIndex: 100,
    },
    root: {
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        minHeight: "100vh",
        alignContent: "flex-start",
    },
    progressRow: {
        display: "flex",
        /* flexWrap: "wrap",
        flexGrow: 1, */
        position: "fixed",
        top: 0,
        width: "100%",
        maxWidth: "1200px",
        backgroundColor: "#fff",
        zIndex: 99,
    },
    progressBar: {
        /* flexBasis: "100%", */
        flexGrow: 1,
        margin: theme.spacing(2),
    },
    rowRoot: {
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "column",
        margin: "0 auto",
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
    actionRow: {
        display: "flex",
        flexBasis: "100%",
        justifyContent: "space-between",
        margin: "70px 0 10px",
    },
    zoomButton: {
        backgroundColor: theme.palette.inherit.main,
        "&:hover": {
            backgroundColor: theme.palette.inherit.dark,
        }
    },
    replayButton: {
        backgroundColor: theme.palette.default.main,
        "&:hover": {
            backgroundColor: theme.palette.default.dark,
        }
    }
}));

const greenTheme = createMuiTheme({
    palette: {
        greenPrimary: { main: green[500], contrastText: "#fff" },
    },
});


export default function Board(props){
    const theme = useTheme();
    const classes = useStyles(theme);

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
    const [rowRootMaxWidth, setRowRootMaxWidth] = useState("none");

    const [challengeCompleteMessage, setChallengeCompleteMessage] = useState("");


    const [replayDialogOpen, setReplayDialogOpen] = useState(false);


    //stop watch
    const [totalTime, setTotalTime] = useState(0);
    const [timerStart, setTimerStart] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    
    let firstFlip = useRef(undefined);
    let secondFlip = useRef(undefined);
    let challengeLevel = useRef(undefined);
    const rootElement = useRef(null);
    const rowRootElement = useRef(null);
    /* const measuredRef = useCallback(root => {
        if (root !== null && rowRootElement.current !== null) {
            const gap = root.getBoundingClientRect().height - rowRootElement.current.getBoundingClientRect().height;
            const ratio = rowRootElement.current.getBoundingClientRect().height / rowRootElement.current.getBoundingClientRect().width;
            const newHeight = window.innerHeight - gap;
            const newWidth = newHeight / ratio;
            setRowRootMaxWidth(newWidth);
        }
      }, []); */
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
                
                if(flipList.filter(item => item).length === flipList.length){   //finish the game
                    setTimerStart(false);
                    setTimeout(()=>{
                        setDialogOpen(true);
                    }, 500);

                    if(challengeMapping[challengeLevel.current+1] === undefined){    //complete last challenge, get the ranking of totalTime from backend
                        axios({
                            url: "",
                            method: "POST",
                            data: {
                                finishTime: totalTime,
                            }
                        })
                        .then(response => {
                            let rank = response.data.rank;
                            setChallengeCompleteMessage(", ranking "+rank+"% ahead.");
                        })
                        .catch(e =>{
                            console.log(e);
                        });
                    }
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

    async function prepareImage(amount, duplicateObj){
        let timeStamp = Date.now();
        let urlList = Array.apply(null, Array(amount)).map((item, index) => { return apiConfig.baseUrl+"?random="+(timeStamp+index) });
        //console.log('urlList ', urlList);
        let count = 0;
        let imagePromiseList = urlList.map(url => 
            axios.get(url)
        );
        let promises = await axios.all(imagePromiseList);
        let imageURLList = promises.map(item => item.request.responseURL);
        //console.log("current imageURLList ", imageURLList.sort());
        let {totalObj, duplicateList} = generateTotalObj(imageURLList, duplicateObj);
        //console.log("duplicate imageURLList ", duplicateList);
        if(duplicateList.length === 0){
            //return imageURLList;
            return Object.keys(totalObj);
        }
        else{   //found duplicate, need to re-axios those urls
            //console.log('found duplicates, go into recursion');
            let returnList = await prepareImage(duplicateList.length, totalObj);
            //return Object.keys(totalObj).concat(returnList);
            return Object.keys(totalObj);
        }
    }

    const init = async () =>{
        let total = Math.ceil(size.row * size.column / 2);
        let imageURLList;
        if(challengeLevel.current !== undefined) //challenge mode
            imageURLList = challengeMapping[challengeLevel.current].images;
        else    //normal mode
            imageURLList = await prepareImage(total, {});
        let blobPromiseList = imageURLList.map((url, index) => axios.get(url, {
                responseType: 'blob'
            })
        );
        //generate a shuffled index list for generating the tiles, and a flip list default with false
        axios.all(blobPromiseList).then(()=>{
            let indexList = shuffleGenerate(imageURLList);
            setImageList(imageURLList);
            setMatchList(indexList);
            setFlipList(new Array(indexList.length).fill(false));
            setTimeout(()=>{
                setLoading(false);
                setTimerStart(true);
                if(challengeLevel.current === 1){   //only setStartTime at beginning of challenge
                    setTotalTime(0);
                    setStartTime(Date.now());
                }
            }, 0);
        });
    }

    const handleClick = (event, props) =>{
        //console.log(props.index);
        let index = parseInt(event.currentTarget.getAttribute('index'));
        //if the clicked tile is already flip, do nothing.
        if(flipList[index]){
            //console.log("tile "+index+" has already been successfully flipped");
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
        setTimerStart(false);
        setReplayDialogOpen(true);
    }

    const handleDialogYes = () =>{
        firstFlip.current = secondFlip.current = undefined;
        setDialogOpen(false);
        if(challengeLevel.current !== undefined){
            if(challengeMapping[challengeLevel.current+1] === undefined){   //finish all challenge, show total time and rank
                //complete all challenge
                //axios({})
            }
            else{
                challengeLevel.current += 1;
                setDimensionSelected(true);
                setLoading(true);
                setSize({
                    row: challengeMapping[challengeLevel.current].rows,
                    column: challengeMapping[challengeLevel.current].columns 
                });
            }
        }
        else{
            setDimensionSelected(false);
            //setLoading(true);
            setFlipList([]);
            setImageList([]);
            setMatchList([]);
            setFlipProgress(1);
            //init();
        }
    }

    const handleZoom = () =>{
        if(rowRootMaxWidth === "none"){
            const gap = rootElement.current.getBoundingClientRect().height - rowRootElement.current.getBoundingClientRect().height;
            const ratio = rowRootElement.current.getBoundingClientRect().height / rowRootElement.current.getBoundingClientRect().width;
            const newHeight = window.innerHeight - gap;
            const newWidth = newHeight / ratio;
            setRowRootMaxWidth(newWidth + "px");
        }
        else{
            setRowRootMaxWidth("none");
        }
    }

    const shuffleAndReplay = () =>{
        firstFlip.current = secondFlip.current = undefined;
        let indexList = shuffleGenerate(imageList);
        setMatchList(indexList);
        setFlipList(new Array(indexList.length).fill(false));
        setDialogOpen(false);
        setFlipProgress(1);

        setReplayDialogOpen(false);
        if(challengeLevel.current !== undefined){
            //setStartTime(Date.now());
            setTimerStart(true);
        }
            
    }

    const finishInit = (isChallenge, size) =>{
        if(isChallenge){
            //for korean face
            challengeLevel.current = 1;
            setDimensionSelected(true);
            setLoading(true);
            setSize({
                row: challengeMapping[challengeLevel.current].rows,
                column: challengeMapping[challengeLevel.current].columns
            });
        }
        else{
            challengeLevel.current = undefined;
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

    const handleCloseReplayDialog = () =>{
        setReplayDialogOpen(false);
        setTimerStart(true);
    }

    const handleMainPage = () =>{
        setTimerStart(false);
        //setStartTime(Date.now());
        setReplayDialogOpen(false);
        setDimensionSelected(false);
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
        
            
            <div className={classes.root} ref={rootElement}>
                <div className={classes.progressRow}>
                    <Typography variant="h6" gutterBottom>Completion {flipProgress === 1 ? 0 : flipProgress}%</Typography>
                    <LinearProgress className={classes.progressBar} variant="determinate" value={flipProgress} />
                </div>
                <div className={classes.actionRow}>
                    <Button
                        variant="contained"
                        onClick={handleZoom}
                        className={classes.zoomButton}
                        endIcon={<ZoomOutMapIcon />}
                    >
                        Zoom
                    </Button>
                    {challengeLevel.current !== undefined && <StopWatch startTime={startTime} setStartTime={setStartTime} totalTime={totalTime} setTotalTime={setTotalTime} timerStart={timerStart} />}
                    <Button
                        variant="contained"
                        onClick={handleReplay}
                        className={classes.replayButton}
                        endIcon={<ReplayIcon />}
                    >
                        Replay
                    </Button>
                </div>
                {dimensionSelected && !isLoading && (
                <div className={classes.rowRoot} ref={rowRootElement} style={{maxWidth: rowRootMaxWidth}}>
                    {chunk(matchList, size.column).map((arr, index)=>
                        <div key={"row"+index} className={classes.columnRoot}>
                            {arr.map((match, ind) => {
                                let trueIndex = index * size.column + ind;
                                return (
                                    <Tile key={"column"+trueIndex} index={trueIndex} flip={flipList[trueIndex]} columns={size.column} url={imageList[match]} onClick={handleClick} />
                                )
                            })}
                        </div>
                    )}
                </div>
                )}

                {dialogOpen && (
                    <Dialog
                        className={classes.dialog}
                        open={dialogOpen}
                        onClose={handleCloseDialog}
                        aria-labelledby="finish-dialog"
                        disableBackdropClick
                    >
                        <DialogTitle id="finish-dialog">Congratulations!</DialogTitle>
                        <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {challengeLevel.current !== undefined ? `You have passed level ${challengeLevel.current}, your total time is +${totalTime}` + (challengeLevel.current === 0 ? challengeCompleteMessage : ", do you like to continue?") : "You have finished the game. Do you like to start a new game?"}
                        </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={handleCloseDialog} color="inherit">
                            No
                        </Button>
                        <Button onClick={shuffleAndReplay} color="default" autoFocus>
                            No, shuffle and replay
                        </Button>
                        <Button onClick={handleDialogYes} color="primary" autoFocus>
                            Yes
                        </Button>
                        </DialogActions>
                    </Dialog>
                )}

                {replayDialogOpen && (
                    <Dialog
                        className={classes.replayDialog}
                        open={replayDialogOpen}
                        onClose={handleCloseReplayDialog}
                        aria-labelledby="replay-dialog"
                        disableBackdropClick
                    >
                        <DialogTitle id="replay-dialog">Do you want to replay?</DialogTitle>
                        <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Do you want to replay?
                        </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={handleCloseReplayDialog} color="inherit">
                            No
                        </Button>
                        <Button onClick={shuffleAndReplay} color="default" autoFocus>
                            Yes, shuffle and replay
                        </Button>
                        <Button onClick={handleMainPage} color="primary" autoFocus>
                            Yes, re-select dimension
                        </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </div>
            <AnnouncementBar />
        </div>
    )
}



function generateTotalObj(arr, duplicateObj){
    /* var uniq = arr.map((item) => {
        return {
        count: 1,
        name: item
        }
    }).reduce((a, b) => {
        a[b.name] = (a[b.name] || 0) + b.count
        return a
    }, {}) 
    return Object.keys(uniq).filter((a) => uniq[a] > 1);*/
    
    let duplicateList = [];
    if(duplicateObj === undefined)
        duplicateObj = {};
    arr.forEach(element => {
        if(duplicateObj[element] === undefined)
            duplicateObj[element] = 1;
        else{
            duplicateObj[element] += 1;
            duplicateList.push(element);
        }
    });
    return {
        totalObj: duplicateObj,
        duplicateList: duplicateList
    };
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