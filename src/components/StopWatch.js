import React, { useState, useEffect, useRef } from 'react';
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
        if(props.timerStart){   //start
            if(props.totalTime !== 0){  //if this is not the new start, but a pause -> start
                refStartTime.current = Date.now() - props.totalTime;
                props.setStartTime(refStartTime.current);
            }
            props.setTotalTime(Date.now() - refStartTime.current);
            timerInterval.current = setInterval(()=>{
                props.setTotalTime(Date.now() - refStartTime.current);
            }, 10);
        }
        else{   //stop
            if(timerInterval.current !== undefined)
                clearInterval(timerInterval.current);
        }
    }, [props.timerStart]);

    useEffect(()=>{
        if(refStartTime.current !== props.startTime){   //if not equal, the StopWatch is reset and restarted
            console.log('refStartTime.current '+refStartTime.current+' != props.startTime '+props.startTime);
            refStartTime.current = props.startTime;
            props.setTotalTime(0);
        }        
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