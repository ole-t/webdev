
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globCallbacksForSetStateRedux, mReduxActionsListObject } from "./store/globStore.js";

function BurgerButton() {
    
    const current_isOpenMobileMenu_DISPATCH = useSelector(mState => mState.isOpenMobileMenu_Slice.current_isOpenMobileMenu);

    const buttonHeight = 20;
    const buttonWidth = 26;
    // получаем угол в радианах 
    let cutRotateLines = Math.atan(buttonHeight / buttonWidth);
    // переводим радианы в градусы
    cutRotateLines = cutRotateLines * 180 / 3.14;
    // добавляем градусов для вращения
    // cutRotateLines = cutRotateLines + 180;
    // console.log("cutRotateLines=" + cutRotateLines);

    let mStyle_buttonClosed = {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flexWrap: "nowrap",
        justifyContent: "center",
        alignItems: "center",
        height: buttonHeight + "px",
        width: buttonWidth + "px",

        // border: "1px solid yellow",
        transition: "0.5s",
    }

    let mStyle_buttonOpen = {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flexWrap: "nowrap",
        justifyContent: "center",
        alignItems: "center",
        height: buttonHeight,
        width: buttonWidth,

        // border: "1px solid red",
        transition: "0.5s",
    }


    let mStyle_singleLineDefault = {
        height: "1px",
        width: "100%",
        border: "1px solid",
        marginTop: "2px",
        marginBottom: "2px",
        transition: "0.5s",
    }

    let mStyle_singleLine_turnRight = {
        height: "1px",
        width: "100%",
        border: "1px solid",
        marginTop: "2px",
        marginBottom: "2px",
        transition: "0.5s",

        position: "absolute",
        transform: `rotate(-${cutRotateLines}deg)`,
    }

    let mStyle_singleLine_center = {
        opasity: 0,
        transition: "0.5s",

    }

    let mStyle_singleLine_turnLeft = {
        height: "2px",
        width: "100%",
        border: "1px solid",
        marginTop: "1.5px",
        marginBottom: "1.5px",
        transition: "0.5s",

        position: "absolute",
        transform: `rotate(${cutRotateLines}deg)`,
    }

    return (
        <div className="burgerButton"
            style={current_isOpenMobileMenu_DISPATCH ? mStyle_buttonOpen : mStyle_buttonClosed}
            onClick={() => {
                globCallbacksForSetStateRedux.mSet_isOpenMobileMenu_Redux(!current_isOpenMobileMenu_DISPATCH);
            }}
        >
            <div style={current_isOpenMobileMenu_DISPATCH ? mStyle_singleLine_turnRight : mStyle_singleLineDefault}> </div>

            <div style={current_isOpenMobileMenu_DISPATCH ? mStyle_singleLine_center : mStyle_singleLineDefault}
            >
            </div>

            <div style={current_isOpenMobileMenu_DISPATCH ? mStyle_singleLine_turnLeft : mStyle_singleLineDefault}
            > </div>
        </div>
    )
}

// --------------------------------

export default BurgerButton;