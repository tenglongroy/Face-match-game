import React from "react";
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';


const useStyles = makeStyles({
    tileRoot: {
        flexGrow: 1,
        padding: "5px",
        perspective: "1000px",
        // transform: "rotateY(180deg)",
        flexBasis: props => `calc(100% / ${props.columns})`,
    },
    tileInner: {
        position: "relative",
        display: "flex",
        transition: "transform 0.4s",
        transformStyle: "preserve-3d",
    },
    flipped: {
        //transform: "none",
        '& $tileInner':{
            transform: "rotateY(180deg)",
        },
    },
    
    innerImg: {
        width: "100%",
        height: "auto",
        transform: "rotateY(180deg)",
        backfaceVisibility: "hidden",
    },
    innerCover: {
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "blue",
        color: "red",
        backfaceVisibility: "hidden",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    }
});


export default function Tile(props){
    const classes = useStyles(props);


    return(
        <div 
            className={clsx(classes.tileRoot,{
                [classes.flipped] : props.flip
            })}
            index={props.index}
            onClick={(event) => props.onClick(event, props)}
        >
            <div className={clsx(classes.tileInner)}>
                <img 
                    className={clsx(classes.innerImg)}
                    src={props.url} alt="tile"
                />
                <div className={classes.innerCover}>
                    <HelpOutlineIcon style={{ fontSize: 60 }}/>
                </div>
            </div>
        </div>
    )
}