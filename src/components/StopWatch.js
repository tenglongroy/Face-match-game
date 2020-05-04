import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';


const useStyle = makeStyles(theme => ({
    stopwatchRoot:{

    },
    stopwatchDisplay: {

    }
}));


export default function StopWatch(props){
    const classes = useStyle();
    //const [start, setStart] = useState(props.start || false);
    //const totalTime = props.totalTime || 0;
    //const startTime = props.startTime || Date.now();

    const timerInterval = useRef(undefined);
    const refStartTime = useRef(props.startTime);

    useEffect(()=>{
        if(props.timerStart){
            timerInterval.current = setInterval(()=>{
                props.setTotalTime(Date.now() - refStartTime.current);
            }, 10);
        }
        else{
            if(timerInterval.current !== undefined)
                clearInterval(timerInterval.current);
        }
    }, [props.timerStart]);

    useEffect(()=>{
        refStartTime.current = props.startTime;
    }, [props.startTime]);

    const centiseconds = ("0" + (Math.floor(props.totalTime / 10) % 100)).slice(-2);
    const seconds = ("0" + (Math.floor(props.totalTime / 1000) % 60)).slice(-2);
    const minutes = ("0" + (Math.floor(props.totalTime / 60000) % 60)).slice(-2);
    const hours = ("0" + Math.floor(props.totalTime / 3600000)).slice(-2);


    return (
        <div className={classes.stopwatchRoot}>
            <div className={classes.stopwatchDisplay}>
                {hours} : {minutes} : {seconds} : {centiseconds}
            </div>
        </div>
    )
}



function StopWatch1(props){

    const classes = useStyle();

    const [startMillSecond, setStartMillSecond] = useState(props.startSecond || undefined);
    const [totalTime, setTotalTime] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [stopTimer, setStopTimer] = useState(props.stopTimer || false);
    const [pauseTimer, setPauseTimer] = useState(props.pauseTimer || false);

    const timerInterval = useRef(undefined);

    useEffect(()=>{
        if(startMillSecond != undefined){
            timerInterval.current = setInterval(() =>{
                setTotalTime(Date.now() - startMillSecond);
            }, 10);
            setTimerRunning(true);
            setStopTimer(false);
        }

        return ()=>{
            clearInterval(timerInterval.current);
        }
    }, [startMillSecond]);

    useEffect(()=>{
        if(stopTimer){
            clearInterval(timerInterval.current);
            setTimerRunning(false);
            props.setTotalTime(totalTime);
        }
    }, [stopTimer]);

    useEffect(()=>{
        if(pauseTimer){
            clearInterval(timerInterval.current);
            setTimerRunning(false);
        }
        else{
            clearInterval(timerInterval.current);
            timerInterval.current = setInterval(() =>{
                setTotalTime(Date.now() - startMillSecond);
            }, 10);
            setTimerRunning(true);
        }
    }, [pauseTimer]);

    const centiseconds = ("0" + (Math.floor(totalTime / 10) % 100)).slice(-2);
    const seconds = ("0" + (Math.floor(totalTime / 1000) % 60)).slice(-2);
    const minutes = ("0" + (Math.floor(totalTime / 60000) % 60)).slice(-2);
    const hours = ("0" + Math.floor(totalTime / 3600000)).slice(-2);
    return (
        <div className={classes.stopwatchRoot}>
            <div className={classes.stopwatchDisplay}>
                {hours} : {minutes} : {seconds} : {centiseconds}
            </div>
        </div>
    )
}