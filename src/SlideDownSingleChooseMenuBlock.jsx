
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { globCallbacksForSetStateRedux, mReduxActionsListObject } from "./store/globStore.js";

import GlobFunctions from "./GlobFunctions.js";

import m_SVG_ICONS from "./m_SVG_ICONS.js";

// это отдельный "выпадающий" блок с возможностью изменением верхнего значения
function SlideDownSingleChooseMenuBlock() {
    // const [topValue, set_topValue] = useState("English");
    const [isOpenMenu, set_isOpenMenu] = useState(false);

    const current_language_DISPATCH = useSelector(mState => mState.language_Slice.current_language);

    const mStyle_langChooseRow = {
        display: "flex",
        justifyContent: "space-between",
        //width: "100%",
        marginTop: "10px",
        cursor: "pointer",
    }

    const mStyle_flagBlock = {
        height: "16px",
        width: "22px",
        marginLeft: "10px",
    }


    return (
        <div className="SlideDownMenuMainBlock"
            style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                // width: "fit-content",
               // border: "solid 1px grey",
               userSelect: "none",
            }}
            onClickCapture={() => { set_isOpenMenu(!isOpenMenu) }}
            // onBlur={() => {set_isOpenMenu(false)}}
            onMouseLeave={() => { set_isOpenMenu(false) }}
        >
            <div className="topButton"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-end", // нужно, иначе маркер справа смещается вверх
                    cursor: "pointer",
                    zIndex: 2, // чтоюы выпадаюзий блок не перекрывал верхнюю кнопку. И чтобы на главной кнопке правильно отображался Pointer
                }}
            >

                <div className="selectedLang"
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-end", // нужно, иначе маркер справа смещается вверх
                        height: "16px",
                        width: "22px",
                    }}
                >
                    

                    {(current_language_DISPATCH == "en")
                        ?
                        <img src="noReactStaticFiles/img/flagEn.png" height={"100%"} width={"100%"} />
                        : null
                    }

                    {(current_language_DISPATCH == "de")
                        ?
                        <img src="noReactStaticFiles/img/flagDe.png" height={"100%"} width={"100%"} />
                        : null
                    }

                    {(current_language_DISPATCH == "pl")
                        ?
                        <img src="noReactStaticFiles/img/flagPl.png" height={"100%"} width={"100%"} />
                        : null
                    }

                    {(current_language_DISPATCH == "ua")
                        ?
                        <img src="noReactStaticFiles/img/flagUa.png" height={"100%"} width={"100%"} />
                        : null
                    }

                    {(current_language_DISPATCH == "ru")
                        ?
                        <img src="noReactStaticFiles/img/flagRu.png" height={"100%"} width={"100%"} title="Яхык сайта" />
                        : null
                    }

                </div>

                <div className="blockForSVG"
                    style={{
                        height: "1em",
                        marginLeft: "2px",
                    }}
                >
                    <m_SVG_ICONS.vectorDown className="mSvgFile"
                        style={{
                            // backgroundColor: "gray",
                            // fill: "red",
                        }}
                    />
                </div>
            </div>

            <div className="downSlideMenuContenner_posAbs"
                // ВАЖНО ! В родительском элементе сверху установлен стиль position: "relstive"
                style={
                    isOpenMenu
                        ?
                        {
                            position: "absolute",
                            display: "flex",
                            flexDirection: "column",
                            padding: "5px",
                            paddingTop: "30px", // необходимо именно paddingTop, иначе произойдет потеря фокуса при попаданиее мышью в интервал
                            left: "-200%",
                            backgroundColor: "unset", // необх прозрачней фон, иначе перекрывается верхний блок
                            // backgroundColor: "rgba(100, 100, 100, 0.5)",
                            // width: "100%"
                            zIndex: 1, // чтоюы выпадаюзий блок не перекрывал верхнюю кнопку. И чтобы на главной кнопке правильно отображался Pointer
                        }
                        :
                        { display: "none" }
                }
            >

                <div className="downSlideMenuGroupBlock"
                    style={{
                        // backgroundColor: "lightcyan",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "rgba(50, 50, 50, 0.9)",
                        padding: "5px",
                    }}
                >

                    <div className="menuKontentBlock"
                        style={mStyle_langChooseRow}
                        onClickCapture={() => {
                            globCallbacksForSetStateRedux.mSet_current_language_Redux("en");
                        }}
                    >
                        <div> English </div>

                        <div style={mStyle_flagBlock}>
                            <img src="noReactStaticFiles/img/flagEn.png" height={"100%"} width={"100%"} />
                        </div>
                    </div>

                    <div className="menuKontentBlock"
                        style={mStyle_langChooseRow}
                        onClickCapture={() => {
                            globCallbacksForSetStateRedux.mSet_current_language_Redux("de");
                        }}
                    >
                        <div> Deutsch </div>

                        <div style={mStyle_flagBlock}>
                            <img src="noReactStaticFiles/img/flagDe.png" height={"100%"} width={"100%"} />
                        </div>
                    </div>

                    <div className="menuKontentBlock"
                        style={mStyle_langChooseRow}
                        onClickCapture={() => {
                            globCallbacksForSetStateRedux.mSet_current_language_Redux("pl");
                        }}
                    >
                        <div> Poland </div>

                        <div style={mStyle_flagBlock}>
                            <img src="noReactStaticFiles/img/flagPl.png" height={"100%"} width={"100%"} />
                        </div>
                    </div>

                    <div className="menuKontentBlock"
                        style={mStyle_langChooseRow}
                        onClickCapture={() => {
                            globCallbacksForSetStateRedux.mSet_current_language_Redux("ua");
                        }}
                    >
                        <div> Ukraine </div>

                        <div style={mStyle_flagBlock}>
                            <img src="noReactStaticFiles/img/flagUa.png" height={"100%"} width={"100%"} />
                        </div>
                    </div>

                    <div className="menuKontentBlock"
                        style={mStyle_langChooseRow}
                        onClickCapture={() => {
                            globCallbacksForSetStateRedux.mSet_current_language_Redux("ru");
                        }}
                    >
                        <div> Ru </div>

                        <div style={mStyle_flagBlock}>
                            <img src="noReactStaticFiles/img/flagRu.png" height={"100%"} width={"100%"} />
                        </div>
                    </div>

                </div>
            </div>
        </div >
    )

}


// --------------------------------

export default SlideDownSingleChooseMenuBlock;