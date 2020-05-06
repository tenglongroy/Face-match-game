import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {defaultAnnouncement} from '../config';



const useStyles = makeStyles(theme => ({
    announcementBar: {
        position: "fixed",
        width: "100%",
        left: 0,
        bottom: 0,
        opacity: 0,
        transition: "0.3s all ease",
        height: 30,
        display: "flex",
        justifyContent: "center",
    },
    showBar: {
        opacity: 1,
        "& $announcementText": {
            bottom: 0,
        }
    },
    announcementText: {
        position: "absolute",
        bottom: -30,
        height: 30,
        display: "flex",
        alignItems: "center",
        transition: "0.3s all ease",
    }
}))


export default function AnnouncementBar(props){
    const classes = useStyles();

    const [announcement, setAnnouncement] = useState(defaultAnnouncement);
    const [show, setShow] = useState(false);

    useEffect(()=>{
        //Axios({});
    });

    const handleMouseEnter = () =>{
        setShow(true);
    }
    const handleMouseLeave = () =>{
        setShow(false);
    }


    return (
        <div 
            className={clsx(classes.announcementBar,{
                [classes.showBar]: show
            })}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Typography className={classes.announcementText} variant="subtitle2">
                {announcement}
            </Typography>
        </div>
    )
}