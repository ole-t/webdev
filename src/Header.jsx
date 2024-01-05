
import React from 'react';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import BurgerButton from "./BurgerButton.jsx";
import SlideDownSingleChooseMenuBlock from "./SlideDownSingleChooseMenuBlock.jsx";


export default function Header() {

    const current_mobileStatus_DISPATCH = useSelector(mState => mState.mobileStatus_Slice.current_mobileStatus);

    return (
        <div className='m_header'
            style={{
                display: "flex",
                flexDirection: 'row',
                justifyContent: "space-between",
                alignItems: "center",
                height: "3em",
                minHeight: "3em",
                borderBottom: "1px solid gray",
                paddingLeft: "4px",
                paddingRight: "4px",
            }}
        >
            <div className='header_leftBlock'>
                Web studio Alias
            </div>



            <div className='header_rightBlock'>

                <div className='languageBlock'>
                    <SlideDownSingleChooseMenuBlock />
                </div>

                <div className='burgerContenner'
                    style={
                        current_mobileStatus_DISPATCH
                        ? { marginLeft: "50px", }
                        : { display: "none", }
                    
                    }
                >
                    <BurgerButton />
                </div>


            </div>

        </div>
    )

}

//---------------------------



