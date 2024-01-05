
import React from 'react';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { globCallbacksForSetStateRedux, mReduxActionsListObject, globStateMirror } from "./store/globStore.js";
import GlobFunctions from "./GlobFunctions.js";
import { useInView } from 'react-intersection-observer';
import GlobData from './GlobData.js';

// переменные прослушивателей созжаем в useEffect для того, чтобы не созавать многократные копии этих прослушивателей при перерисовке функций
let mEventListener_wheel = null;
let mEventListener_touchstart = null;
let mEventListener_touchmove = null;
let mEventListener_touchmove_leftMenu = null;
let mEventListener_touchend = null;
let mEventListener_touchcansel = null;
let mEventListener_scroll = null;
let mEventListener_scrollend = null;
let mEventListener_resize = null;

// след переменную используем для избежания побочного скроллинга при испольщовании точПад
let timePreviosMouseScroll = 0;
// для определения нового действия пользователя исходим из того, что в новом скролле скорость нового скролла будет быстрее, чем затухающая скорость предыдущего скролла
let previos_eTimeStamp = 0;
// важно - обхявление переменной жолэно быть за пределами фун Maim, т.к. фун Main постоянно перерисовывается
let isPossibleScrolling = true;
// Тут указываем, происходит ли в наст время прокрутка фрейма
let isScrollingRun = false;
let verticalScrollingVektor = null; // 

let x1_onTouch = null;
let y1_onTouch = null;
let timeStartTouch = 0;

// в след объект после монтирования поместим ссылки на скролл-блоки
const listScrollBlocksFinedObjects = {};

// след переменная при изменении срабатывает как setState, обновляет состояние внутри хуков. Видимо потому, что объект wasReadingBlocksList является объектом ---new Set()---, т.е. функцией, на которую реагирует реакт
let wasReadingBlocksList = new Set();

class ScrollingSteck {
    constructor() {
        this.timeStamp_Stack = [];
        this.topScroll_Stack = [];
        this.delta_timeStamp_Stack = [];
        this.delta_topScroll_Stack = [];
    }

    // сюда передадим событие скроллинга в качестве аргумента
    mF_addData(timeStamp, topScroll) {

        this.timeStamp_Stack.push(timeStamp);
        if (this.timeStamp_Stack.length > 4) this.timeStamp_Stack.shift();

        this.topScroll_Stack.push(topScroll);
        if (this.topScroll_Stack.length > 4) this.topScroll_Stack.shift();

        this.mF_calculateDeltaData();
    }
    // тут вычисляем числовые интервалы между событиями
    mF_calculateDeltaData() {
        console.log(this.delta_timeStamp_Stack);


        for (let i = 0; i < 3; i++) {

            if (this.timeStamp_Stack[i] && this.timeStamp_Stack[i + 1]) {
                this.delta_timeStamp_Stack[i] = this.timeStamp_Stack[i + 1] - this.timeStamp_Stack[i];
            }
            else this.delta_timeStamp_Stack[i] = "не определено";


            if (this.delta_topScroll_Stack[i] && this.delta_topScroll_Stack[i + 1]) {
                this.delta_timeStamp_Stack[i] = this.topScroll_Stack[i + 1] - this.topScroll_Stack[i];
            }
            else this.delta_timeStamp_Stack[i] = "не определено";
        }
    }
}

function Main() {
    //    console.log("run Main");
    const [wightScrollingField, set_wightScrollingField] = useState(0); // сюда росле монтирования определим и запишем ширису полосы прокрутки

    const mDispatch = useDispatch();
    const colorTeam_number_DISPATCH = useSelector(mState => mState.colorTeam_Slice.colorTeam_number);

    const current_mobileStatus_DISPATCH = useSelector(mState => mState.mobileStatus_Slice.current_mobileStatus);

    const current_isOpenMobileMenu_DISPATCH = useSelector(mState => mState.isOpenMobileMenu_Slice.current_isOpenMobileMenu);

    const current_language_DISPATCH = useSelector(mState => mState.language_Slice.current_language);

    const currentActiveScrollingBlockValue_DISPATCH = useSelector(mState => mState.currentActiveScrollingBlockValue_Slice.currentActiveScrollingBlockValue);

    const ref_scrollContenner = useRef();
    GlobData.ref_scrollContenner = ref_scrollContenner;

    // отлавливаем и прерываем собятия прокрутки по умолчанию
    useEffect(() => {

        mEventListener_wheel = document.getElementById("id_scrollContenner").addEventListener("wheel", (e) => {
            //  e.preventDefault();
        }, { passive: false }
        );

        mEventListener_scroll = document.getElementById("id_scrollContenner").addEventListener("scroll", () => {
            isScrollingRun = true;
            // finalScrollingPass();
        }
        );

        mEventListener_scrollend = document.getElementById("id_scrollContenner").addEventListener("scrollend", () => {
            isScrollingRun = false;
            finalScrollingPass();
        }
        );

        // при изменении размера окна
        mEventListener_resize = window.addEventListener("resize", () => {
            GlobFunctions.mediaAdapter();
            GlobFunctions.videoMooveAdaption();
        })

    }, []);

    // Тут проверяем и устанавливаем медиаадаптауию
    useEffect(() => {
        GlobFunctions.mediaAdapter();
        GlobFunctions.videoMooveAdaption();
    }, []);

    // Тут получаем ширину скролл полосы и записываем в переменную
    useEffect(() => {
        set_wightScrollingField(document.getElementById("id_scrollContenner").offsetWidth - document.getElementById("id_scrollContenner").clientWidth);
        // GlobFunctions.canvasEffect();
    }, []);

    // Тут находим скролл-блоки, и ссылки на них помещаем в список блоков
    useEffect(() => {
        for (let index = 1; index <= 9; index++) {
            listScrollBlocksFinedObjects["id_scrollBlock_0" + index] = document.getElementById("id_scrollBlock_0" + index);
            // console.log(listScrollBlocksFinedObjects["id_scrollBlock_0" + index] );
        }
        // console.log("listScrollBlocksFinedObjects=");
        // console.log(listScrollBlocksFinedObjects);
    });

    // опреределяем и устанавливаем язык пользователя
    useEffect(() => {
        globCallbacksForSetStateRedux.mSet_current_language_Redux(
            GlobFunctions.getDefault_languageFromBrowser()
        );
    }, []);


    // заносим колбеки для управления Редаксом в глоб обьект
    {
        globCallbacksForSetStateRedux.mSet_colorTeam_number = (payload) => {
            mDispatch(mReduxActionsListObject.mSet_colorTeam_number(payload));
        }
        globCallbacksForSetStateRedux.mChange_colorTeam = () => {
            mDispatch(mReduxActionsListObject.mChange_colorTeam())
        }
        globCallbacksForSetStateRedux.mSet_current_mobileStatus_Redux = (payload) => {
            mDispatch(mReduxActionsListObject.mSet_current_mobileStatus_Slice(payload))
        }

        globCallbacksForSetStateRedux.mSet_isOpenMobileMenu_Redux = (payload) => {
            mDispatch(mReduxActionsListObject.mSet_isOpenMobileMenu_Slice(payload))
        }

        globCallbacksForSetStateRedux.mSet_current_language_Redux = (payload) => {
            mDispatch(mReduxActionsListObject.mSet_current_language_Slice(payload))
        }

        globCallbacksForSetStateRedux.mSet_currentActiveScrollingBlockValue_Redux = (payload) => {
            mDispatch(mReduxActionsListObject.mSet_currentActiveScrollingBlockValue_Slice(payload))
        }
    }


    const mStyle_navItem_leftMenu = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: "start",
        alignItems: "center",
        // cursor: "pointer", // - перенести в SCSS файле, поскольку значение динамически меняем в зависимости от активного элемента
        // height: "3em",
        overflow: "hidden",
        margin: "4px",
        marginLeft: "8px",
        marginTop: "10px",
        marginBottom: "10px",
        //padding: "4px",

        fontWeight: "bold",
        opacity: "0.8",
        // borderLeft: "1px solid red",
        // borderBottom: "1px solid red",
        // borderBottomLeftRadius: "10px",
    };

    function getAndGotoBookmarkValue(leftMenuItem_ID) {
        console.log("getAndGotoBookmarkValue ");
        // console.log(leftMenuItem_ID);
        // В этой функции опредкляем адрес закладки для перехода, а также переходим к нужной закладке
        // сначала определяем порядковый номер закладки
        let lookingBookmark = leftMenuItem_ID[leftMenuItem_ID.length - 2] + leftMenuItem_ID[leftMenuItem_ID.length - 1];
        // формируем имя искомой закладки след эдемента для перехода по скроооингу
        lookingBookmark = "id_scrollBlock_" + lookingBookmark;

        // осуществляем переход по ссылке
        if (listScrollBlocksFinedObjects[lookingBookmark]) {
            // блокируем скроллинг
            isPossibleScrolling = false;
            listScrollBlocksFinedObjects[lookingBookmark].scrollIntoView();


            // ускоряем скроллинг через долю секунды, чтобы переход на длинные листанции не был сильно долгим
            setTimeout(() => {
                // сначала отключаем плавный скроллинг для элемента
                ref_scrollContenner.current.style.scrollBehavior = "unset";

                // форсируем переход на мгновенной скорости
                // listScrollBlocksFinedObjects[lookingBookmark].scrollIntoView();

                // затем возвращаем плавный скроллинг
                ref_scrollContenner.current.style.scrollBehavior = "smooth";
            }, 300);
        }
    }

    function isActiveCurrentItemMenu(leftMenuItem_ID) {
        let currentItemMenuIndex = leftMenuItem_ID[leftMenuItem_ID.length - 2] + leftMenuItem_ID[leftMenuItem_ID.length - 1];

        let activeContentBlockIndex = currentActiveScrollingBlockValue_DISPATCH[currentActiveScrollingBlockValue_DISPATCH.length - 2] + currentActiveScrollingBlockValue_DISPATCH[currentActiveScrollingBlockValue_DISPATCH.length - 1];

        let isActive = (currentItemMenuIndex == activeContentBlockIndex) ? true : false;

        return isActive;
    }

    return (
        <div className='mMain'
            id='id_mMain'
            style={{
                display: 'flex',
                flexDirection: 'column',
                margin: 0,
                padding: 0,
                overflow: "hidden",
                // border: "solid 8px orange",
            }}

            // действие колесика мыши
            onWheelCapture={(e) => {
                // console.log(e);
                // тут устанавливаем вертикальное направление скроллинга            
                if (e.deltaY) {
                    verticalScrollingVektor = (e.deltaY > 0) ? 1 : -1;
                }

                // scrollingMouse(e);
                timePreviosMouseScroll = e.timeStamp;
            }}

            // Касание к экрану одним пальцем
            onTouchStartCapture={(e) => {
                // console.log("onTouchStartCapture");
                // тут устанавливаем вертикальное направление скроллинга
                x1_onTouch = e.touches[0].clientX;
                y1_onTouch = e.touches[0].clientY;
                timeStartTouch = Date.now();
            }}

            // действие касания по экрану телефона
            onTouchMove={(e) => {
                //  scrollingMouse(e);
                // console.log("RUN onTouchMoveCapture");
                // тут устанавливаем вертикальное направление скроллинга
                if (e.changedTouches) {
                    const y2_onTouch = e.changedTouches[0].clientY;
                    const delta_Y_onTouch = y2_onTouch - y1_onTouch;
                    verticalScrollingVektor = (delta_Y_onTouch > 0) ? 1 : -1;
                }


                gorizontal_changedTouches(e);
            }}

            onTouchEnd={(e) => {
                // console.log("=====" + e);
                // scrollingMouse(e);
                //  gorizontal_changedTouches(e);
            }}

            onTouchCancel={() => {
                x1_onTouch = null;
                y1_onTouch = null;
                timeStartTouch = 0;
            }}

            onResize={() => {
                GlobFunctions.mediaAdapter();
                GlobFunctions.videoMooveAdaption();
            }}
        >
            <div className='mContent'
                style={{
                    position: "relative",
                    display: 'flex',
                    flexDirection: 'row',
                    height: "100%",
                    maxHeight: "100%",
                    overflow: "hidden",
                    // border: "solid 6px red",
                }}
            >

                <div className='leftNavigatorContenner'
                    id='id_leftNavigatorContenner'
                    style={
                        // медиаадаптация - показываем/скрываем левое меню
                        !current_mobileStatus_DISPATCH
                            ? {
                                width: "300px",
                            } // если не активирован мобильный режим - на применяем спец стили
                            :
                            current_isOpenMobileMenu_DISPATCH
                                ?
                                {
                                    flexDirection: "column",
                                    alignItems: "center",
                                    height: "100%",
                                    position: 'absolute',
                                    left: 0,
                                    transition: "0.4s",
                                    backgroundColor: "rgba(50, 50, 50, 0.9)",
                                    maxWidth: "60%",
                                    overflow: "hidden",
                                    padding: "20px",
                                    zIndex: 2,
                                }
                                :
                                {
                                    alignItems: "center",
                                    height: "100%",
                                    position: 'absolute',
                                    left: "-100%",
                                    transition: "0.4s",
                                    backgroundColor: "rgba(50, 50, 50, 0.9)",
                                    maxWidth: "60%",
                                    overflow: "hidden",
                                    padding: "20px",
                                    zIndex: 2,
                                }
                    }
                >

                    <div className='closeBlock'
                        style={{
                            display: current_mobileStatus_DISPATCH ? "flex" : "none",
                            justifyContent: "flex-end",
                            width: "100%",
                        }}
                    >
                        <div className='closeButton'
                            style={{
                                position: "relative",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "40px",
                                width: "40px",
                                border: "solid 2px",
                                borderRadius: "8px",
                                cursor: "pointer",
                            }}
                            onClickCapture={() => {
                                globCallbacksForSetStateRedux.mSet_isOpenMobileMenu_Redux(false);
                            }}
                        >

                            <div style={{
                                height: "1px",
                                width: "100%",
                                border: "1px solid",
                                marginTop: "2px",
                                marginBottom: "2px",
                                position: "absolute",
                                transform: "rotate(-45deg)",
                            }}>
                            </div>

                            <div style={{
                                height: "2px",
                                width: "100%",
                                border: "1px solid",
                                marginTop: "1.5px",
                                marginBottom: "1.5px",
                                position: "absolute",
                                transform: "rotate(45deg)",
                            }}
                            > </div>

                        </div>

                    </div>

                    <div className='leftNavigatorBlock'
                        style={
                            {
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                // padding: "4px",
                                // maxWidth: "90%",
                                // minWidth: "300px",
                                marginRight: "10px",
                                height: "100%",
                                overflow: "hidden",
                            }
                        }
                    >

                        <div
                            className={
                                isActiveCurrentItemMenu("id_scrollBlock_01")
                                    ? "isActive_leftMenuItemStyle"
                                    : "leftMenuItemStyle"
                            }
                            id="id_leftMenu_01"
                            style={mStyle_navItem_leftMenu}
                            onClick={(e) => getAndGotoBookmarkValue(e.target.id)}
                        >
                            {/*    Языковой блок    */}
                            {(current_language_DISPATCH == "de") ? 'Heim' : null}
                            {(current_language_DISPATCH == "pl") ? 'Dom' : null}
                            {(current_language_DISPATCH == "ua") ? 'Головна' : null}
                            {(current_language_DISPATCH == "ru") ? 'Главная' : null}
                            {(current_language_DISPATCH == "en") ? 'Home' : null}
                        </div>

                        <div className='navGroupBox_leftMenu'
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                            }}
                        >

                            <div className='nashiUslugiLeftMenu'
                                style={{
                                    display: 'flex',
                                    justifyContent: "center",
                                    alignItems: "center",
                                    writingMode: "vertical-lr", // вертикальный текст
                                    transform: "rotate(180deg)",
                                    margin: "2px",
                                    // paddingLeft: "4px",
                                    borderLeft: "solid 2px",
                                    borderColor: "rgba(200, 200, 200, 0.6)",
                                    // color: "rgba(200, 200, 200, 0.6)",
                                }}
                            >
                                {/*    Языковой блок    */}
                                {(current_language_DISPATCH == "de") ? 'Unsere Produkte:' : null}
                                {(current_language_DISPATCH == "pl") ? 'Nasze produkty:' : null}
                                {(current_language_DISPATCH == "ua") ? 'Наші продукти:' : null}
                                {(current_language_DISPATCH == "ru") ? ' Наши продукты:' : null}
                                {(current_language_DISPATCH == "en") ? 'Our products:' : null}

                            </div>


                            <div className='leftMenuListBlock'
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >

                                <div className={
                                    isActiveCurrentItemMenu("id_scrollBlock_02")
                                        ? "isActive_leftMenuItemStyle"
                                        : "leftMenuItemStyle"
                                }
                                    id="id_leftMenu_02" style={mStyle_navItem_leftMenu} onClick={(e) => getAndGotoBookmarkValue(e.target.id)}>
                                    {/*    Языковой блок    */}
                                    {(current_language_DISPATCH == "de") ? 'Websites' : null}
                                    {(current_language_DISPATCH == "pl") ? 'Strony internetowe' : null}
                                    {(current_language_DISPATCH == "ua") ? 'Web-сайти' : null}
                                    {(current_language_DISPATCH == "ru") ? 'Web-сйты' : null}
                                    {(current_language_DISPATCH == "en") ? 'Websites' : null}
                                </div>

                                <div className={
                                    isActiveCurrentItemMenu("id_scrollBlock_03")
                                        ? "isActive_leftMenuItemStyle"
                                        : "leftMenuItemStyle"
                                }
                                    id="id_leftMenu_03" style={mStyle_navItem_leftMenu} onClick={(e) => getAndGotoBookmarkValue(e.target.id)}>
                                    {/*    Языковой блок    */}
                                    {(current_language_DISPATCH == "de") ? 'Web Applikationen' : null}
                                    {(current_language_DISPATCH == "pl") ? 'Aplikacje internetowe' : null}
                                    {(current_language_DISPATCH == "ua") ? 'Web-додатки' : null}
                                    {(current_language_DISPATCH == "ru") ? 'Web-приложения' : null}
                                    {(current_language_DISPATCH == "en") ? 'Web applications' : null}
                                </div>

                                <div className={
                                    isActiveCurrentItemMenu("id_scrollBlock_04")
                                        ? "isActive_leftMenuItemStyle"
                                        : "leftMenuItemStyle"
                                }
                                    id="id_leftMenu_04" style={mStyle_navItem_leftMenu} onClick={(e) => getAndGotoBookmarkValue(e.target.id)}>
                                    {/*    Языковой блок    */}
                                    {(current_language_DISPATCH == "de") ? 'Online-Shops' : null}
                                    {(current_language_DISPATCH == "pl") ? 'Sklepy online' : null}
                                    {(current_language_DISPATCH == "ua") ? 'Інтернет магазини' : null}
                                    {(current_language_DISPATCH == "ru") ? 'Интернет магазины' : null}
                                    {(current_language_DISPATCH == "en") ? 'Online stores' : null}
                                </div>

                                <div className={
                                    isActiveCurrentItemMenu("id_scrollBlock_05")
                                        ? "isActive_leftMenuItemStyle"
                                        : "leftMenuItemStyle"
                                }
                                    id="id_leftMenu_05" style={mStyle_navItem_leftMenu} onClick={(e) => getAndGotoBookmarkValue(e.target.id)}>
                                    {/*    Языковой блок    */}
                                    {(current_language_DISPATCH == "de") ? 'Mobile Anwendungen' : null}
                                    {(current_language_DISPATCH == "pl") ? 'Aplikacje mobilne' : null}
                                    {(current_language_DISPATCH == "ua") ? 'Мобільні додатки' : null}
                                    {(current_language_DISPATCH == "ru") ? 'Мобильные приложения' : null}
                                    {(current_language_DISPATCH == "en") ? 'Mobile applications' : null}
                                </div>

                                <div className={
                                    isActiveCurrentItemMenu("id_scrollBlock_06")
                                        ? "isActive_leftMenuItemStyle"
                                        : "leftMenuItemStyle"
                                }
                                    id="id_leftMenu_06" style={mStyle_navItem_leftMenu} onClick={(e) => getAndGotoBookmarkValue(e.target.id)}>
                                    {/*    Языковой блок    */}
                                    {(current_language_DISPATCH == "de") ? 'Chatbots' : null}
                                    {(current_language_DISPATCH == "pl") ? 'Chatboty' : null}
                                    {(current_language_DISPATCH == "ua") ? 'Чат-боти' : null}
                                    {(current_language_DISPATCH == "ru") ? 'Чат-боты' : null}
                                    {(current_language_DISPATCH == "en") ? 'Chatbots' : null}
                                </div>

                                <div className={
                                    isActiveCurrentItemMenu("id_scrollBlock_07")
                                        ? "isActive_leftMenuItemStyle"
                                        : "leftMenuItemStyle"
                                }
                                    id="id_leftMenu_07" style={mStyle_navItem_leftMenu} onClick={(e) => getAndGotoBookmarkValue(e.target.id)}>
                                    {/*    Языковой блок    */}
                                    {(current_language_DISPATCH == "de") ? 'WEB-3, Blockchains, Smart Contracts' : null}
                                    {(current_language_DISPATCH == "pl") ? 'WEB-3, blockchainy, inteligentne kontrakty' : null}
                                    {(current_language_DISPATCH == "ua") ? 'WEB-3, блокчейни, смартконтракти' : null}
                                    {(current_language_DISPATCH == "ru") ? 'WEB-3, блокчейны, смартконтракты' : null}
                                    {(current_language_DISPATCH == "en") ? 'WEB-3, blockchains, smart contracts' : null}
                                </div>

                            </div>

                        </div>


                        <div className={
                            isActiveCurrentItemMenu("id_scrollBlock_08")
                                ? "isActive_leftMenuItemStyle"
                                : "leftMenuItemStyle"
                        }
                            id="id_leftMenu_08" style={mStyle_navItem_leftMenu} onClick={(e) => getAndGotoBookmarkValue(e.target.id)}>
                            {/*    Языковой блок    */}
                            {(current_language_DISPATCH == "de") ? 'Unser Team' : null}
                            {(current_language_DISPATCH == "pl") ? 'Nasz zespół' : null}
                            {(current_language_DISPATCH == "ua") ? 'Наша команда' : null}
                            {(current_language_DISPATCH == "ru") ? 'Наша команда' : null}
                            {(current_language_DISPATCH == "en") ? 'Our team' : null}
                        </div>

                        <div className={
                            isActiveCurrentItemMenu("id_scrollBlock_09")
                                ? "isActive_leftMenuItemStyle"
                                : "leftMenuItemStyle"
                        }
                            id="id_leftMenu_09" style={mStyle_navItem_leftMenu}
                            onClick={(e) => getAndGotoBookmarkValue(e.target.id)}>
                            {/*    Языковой блок    */}
                            {(current_language_DISPATCH == "de") ? 'Kontakte' : null}
                            {(current_language_DISPATCH == "pl") ? 'Łączność' : null}
                            {(current_language_DISPATCH == "ua") ? 'Контакти' : null}
                            {(current_language_DISPATCH == "ru") ? 'Контакты' : null}
                            {(current_language_DISPATCH == "en") ? 'Contacts' : null}
                        </div>
                    </div>
                </div>

                <div className='scrollContenner'
                    id="id_scrollContenner"
                    ref={ref_scrollContenner}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: "100%",
                        overflowX: "hidden",
                        overflowY: "scroll",
                        scrollBehavior: "smooth",
                        flexGrow: 1, // ширина на все свободное место
                        // border: "solid 6px green",
                    }}
                >



                    <Razdel
                        prop_id="id_scrollBlock_01"
                        imgSrc="noReactStaticFiles/img/card_img_01.jpg"
                        razdelHeader={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'Hallo!' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Cześć!' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Привіт!' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Привет!' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'Hello!' : "")
                        }

                        textContent={
                            // Языковой блок 
                            ((current_language_DISPATCH == "de") ? 'Ich bin Webentwickler und außerdem Leiter des Alias-Studios. Gemeinsam mit meinem Team erbringen wir Dienstleistungen für die Entwicklung von Internetprodukten. Unten können Sie die gesamte Liste unserer Dienstleistungen einsehen. Wenn Sie uns kontaktieren, erhalten Sie eine individuelle Ansprache und aufmerksame Betreuung Ihrer Bedürfnisse. Wir kümmern uns um den Erfolg Ihres Projekts, seine Einzigartigkeit und die Übereinstimmung mit Ihren Zielen.' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Jestem web developerem, a także szefem studia Alias. Razem z moim zespołem świadczymy usługi w zakresie rozwoju produktów internetowych. Poniżej możesz zobaczyć całą listę naszych usług. Kontaktując się z nami, otrzymują Państwo indywidualne podejście i uważną uwagę na Państwa potrzeby. Zadbamy o powodzenie Twojego projektu, jego wyjątkowość i zgodność z Twoimi celami.' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Я веб-розробник, а також керівник студії "Alias". Ми разом із моєю командою надаємо послуги з розробки інтернет-продуктів. Далі можна переглянути весь список наших послуг. Звертаючись до нас, ви отримуєте індивідуальний підхід та уважне ставлення до ваших потреб. Ми подбаємо про успішність вашого проекту, його унікальність і відповідність вашим цілям.' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Я являюсь веб-разработчиком, а также руководителем студии "Alias". Мы вместе с моей командой оказываем услуги по разработке интернет-продуктов. Далее вы можете просмотреть весь список наших услуг. Обращаясь к нам, вы получаете индивидуальный подход и внимательное отношение к вашим потребностям. Мы позаботимся об успешности вашего проекта, его уникальности и соответсвии вашим целям.' : "")
                            +
                            ((current_language_DISPATCH == "en") ? "I am a web developer and also the head of the Alias ​​studio. Together with my team, we provide services for the development of Internet products. Below you can view the entire list of our services. By contacting us, you receive an individual approach and attentive attention to your needs. We will take care of the success of your project, its uniqueness and compliance with your goals." : "")
                        }

                    />


                    <Razdel
                        prop_id="id_scrollBlock_02"
                        imgSrc="noReactStaticFiles/img/card_img_02.jpg"
                        razdelHeader={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'WEB-Seiten' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Strony internetowe' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'WEB сайти' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'WEB сайты' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'WEB sites' : "")
                        }
                        textContent={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'Wir entwickeln einfache und komplexe Websites. Es könnte sich um eine einseitige Site wie diese Site handeln. Eine solche Visitenkarten-Website informiert über Sie und Ihre Aktivitäten sowie über die Produkte und Dienstleistungen, die Sie anbieten. Wir erstellen auch Unternehmens- und Multisite-Websites. Solche Websites ermöglichen dem Benutzer neben allgemeinen Informationen auch die Interaktion mit Ihnen, den Austausch von Informationen, den Versand von Daten und vieles mehr.' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Tworzymy proste i złożone strony internetowe. Może to być jednostronicowa witryna, taka jak ta. Taka witryna wizytówkowa opowie o Tobie i Twojej działalności, o produktach i usługach, które oferujesz. Tworzymy także strony internetowe korporacyjne i wielostronne. Takie strony, oprócz ogólnych informacji, pozwalają użytkownikowi na interakcję z Tobą, wymianę informacji, przesyłanie danych i wiele więcej.' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Ми розробляємо прості та складні web-сайти. Це може бути односторінковий сайт, на кшталт цього сайту. Такий сайт-візитка розповість про вас та вашу діяльність, про товари та послуги, які ви пропонуєте. Також ми створюємо корпоративні та багатосторінкові сайти. Такі сайти, окрім загальної інформації, дають можливість користувачеві взаємодіяти з вами, обмінюватися інформацією, надсилати дані та багато іншого.' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Мы разрабатываем простые и сложные web-сайты. Это может быть одностраничный сайт, наподобие этого сайта. Такой сайт-визитка расскажет о вас и вашей деятельности, о товарах и услугах, которые вы предлагаете. Также мы создаем корпоративные и многостаничные сайты. Такие сайты, помимо общей информации, дают возможность пользователю взаимодействовать с вами, обмениваться информацией, отправлять данные и многое другое.' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'We develop simple and complex websites. It could be a one-page site like this site. Such a business card website will tell about you and your activities, about the products and services that you offer. We also create corporate and multi-site websites. Such sites, in addition to general information, allow the user to interact with you, exchange information, send data and much more.' : "")
                        }
                    />

                    <Razdel
                        prop_id="id_scrollBlock_03"
                        imgSrc="noReactStaticFiles/img/card_img_03.jpg"
                        razdelHeader={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'Web Applikationen' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Aplikacje internetowe' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Веб-програми' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Веб-приложения' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'Web Applications' : "")
                        }
                        textContent={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'Wir entwickeln Webanwendungen, die Ihr Unternehmen möglicherweise benötigt. Das sind mehr als nur Websites. Dabei handelt es sich um Programme, mit denen Sie arbeiten und bestimmte Funktionen ausführen können. Tauschen Sie Daten mit anderen Benutzern aus. Bestellungen für Waren aufgeben. Führen Sie beliebige Berechnungen durch. Arbeite als Organisator. Und vieles mehr.' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Tworzymy aplikacje internetowe, których może potrzebować Twoja firma. To coś więcej niż tylko strony internetowe. Są to programy, które umożliwiają pracę i wykonywanie określonych funkcji. Wymieniaj dane z innymi użytkownikami. Składaj zamówienia na towary. Wykonaj dowolne obliczenia. Pracuj jako organizator. I wiele więcej.' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Ми розробляємо веб-програми, які можуть знадобитися для вашого бізнесу. Це вже більше, ніж просто веб-сайти. Це програми, які дозволяють працювати та виконувати певні функції. Обмінюватись даними з іншими користувачами. Здійснювати замовлення товарів. Виконувати будь-які обчислення. Працювати як органайзер. І багато іншого.' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Мы разрабатывам веб-приложения, которые могут потребоваться для вашего бизнеса. Это уже больше, чем просто веб-сайты. Это программы, которые позволяет работать и выполнять определенные функции. Обмениваться данными с другими пользователями. Осуществлять заказы товаров. Выполнять какие-либо вычисления. Работать в качестве органайзера. И многое другое.' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'Web We develop web applications that your business may require. These are more than just websites. These are programs that allow you to work and perform certain functions. Exchange data with other users. Place orders for goods. Perform any calculations. Work as an organizer. And much more.' : "")
                        }
                    />

                    <Razdel
                        prop_id="id_scrollBlock_04"
                        imgSrc="noReactStaticFiles/img/card_img_04.jpg"
                        razdelHeader={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'Online-Shops' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Sklepy online' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Інтернет магазини' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Интернет-магазины' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'Online stores' : "")
                        }
                        textContent={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'Online-Shops gehören zu den Arten von Webanwendungen. Wir heben sie in einem separaten Abschnitt hervor, da sie in unserem täglichen Leben eine große Rolle spielen. Wir alle wissen, was sie sind und wozu sie dienen. Wir erstellen für Sie einen Online-Shop, der Ihnen hilft, Ihre Produkte und Dienstleistungen erfolgreich zu verkaufen und effektiv mit Ihren Kunden zu interagieren.' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Sklepy internetowe to jeden z typów aplikacji webowych. Opisujemy je w osobnym dziale, ponieważ odgrywają one dużą rolę w naszym codziennym życiu. Wszyscy wiemy, czym są i do czego służą. Stworzymy dla Ciebie sklep internetowy, który pomoże Ci skutecznie sprzedawać Twoje produkty i usługi oraz skutecznie komunikować się z klientami.' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Інтернет-магазини - це один із різновидів веб-додатків. Ми їх виділяємо в окремий розділ, оскільки вони відіграють велику роль у нашому повсякденному житті. Ми всі знаємо, що це таке і для чого вони потрібні. Для вас ми створимо інтернет-магазин, який допоможе вам успішно продавати ваші товари та послуги та ефективно взаємодіяти з вашими клієнтами.' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Интернет-магазины - это одно из разновидностей веб-приложений. Мы их выделяем в отдельный раздел, поскольку они играют большую роль в нашей повседневной жизни. Мы все знаем, что это такое, и для чего они нужны. Для вас мы создадим интернет-магазин, который поможет вам успешно продавать ваши товары и услуги, и эффективно взаимодействовать с вашими клиентами.' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'Online stores are one of the types of web applications. We highlight them in a separate section because they play a big role in our daily lives. We all know what they are and what they are for. We will create an online store for you that will help you successfully sell your products and services and effectively interact with your customers.' : "")
                        }
                    />

                    <Razdel
                        prop_id="id_scrollBlock_05"
                        imgSrc="noReactStaticFiles/img/card_img_05.jpg"
                        razdelHeader={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'Mobile Anwendungen' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Aplikacje mobilne' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Мобільні додатки' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Мобильные приложения' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'Mobile applications' : "")
                        }
                        textContent={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'Mobile Anwendungen erfüllen dieselben Funktionen wie normale Webanwendungen. Der Unterschied besteht darin, dass wir diese Programme auf unseren Mobilgeräten installieren. Dadurch laufen sie in einem separaten Frame schneller ab. Und Sie müssen sie nicht jedes Mal über einen Browser herunterladen. Wir können für Sie Webanwendungen entwickeln, die Ihr Unternehmen ergänzen.' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Aplikacje mobilne pełnią te same funkcje, co zwykłe aplikacje internetowe. Różnica polega na tym, że instalujemy te programy na naszych urządzeniach mobilnych. W rezultacie działają szybciej w osobnej ramce. I nie musisz ich pobierać za każdym razem przez przeglądarkę. Możemy stworzyć dla Ciebie aplikacje internetowe, które będą uzupełnieniem Twojego biznesu.' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Мобільні програми виконують ті ж функції, які виконують звичайні веб-програми. Їхня відмінність у тому, що ми встановлюємо ці програми на наші мобільні пристрої. В результаті вони швидше запускаються в окремому кадрі. І їх не потрібно щоразу завантажувати через браучер. Для вас ми можемо розробити веб-програми, які будуть доповнювати ваш бізнес.' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Мобильные приложения выполняют те же функции, которые осуществляют обычные веб-приложения. Их отличие в том, что мы инсталлируем эти программы на наши мобильные устройства. В результате они более быстро запускаются в отдельном фрейме. И их не нужно кажлый раз загружать через браущер. Для вас мы можем разработать веб-приложения, которые будут дополнять ваш бизнес.' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'Mobile applications perform the same functions as regular web applications. Their difference is that we install these programs on our mobile devices. As a result, they run more quickly in a separate frame. And you don’t need to download them every time through a browser. We can develop web applications for you that will complement your business.' : "")
                        }
                    />

                    <Razdel
                        prop_id="id_scrollBlock_06"
                        imgSrc="noReactStaticFiles/img/card_img_06.jpg"
                        razdelHeader={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'Chatbots' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Chatboty' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Чат-боти' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Чат-боты' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'Chatbots' : "")
                        }
                        textContent={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'Chatbots bieten eine zusätzliche Möglichkeit, mit Kunden in Messengern wie Telegram, WhatsApp, Viber und anderen zu interagieren. Manchmal ist es für Benutzer bequemer, diese Methode zu verwenden. Zum Beispiel, um verschiedene Erinnerungen, Informationen über die Verfügbarkeit eines interessanten Produkts im Geschäft oder über die Ankunft einer Kurter-Lieferung zu erhalten. Und natürlich bieten wir auch Dienstleistungen zur Erstellung von Chatbots an.' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Chatboty zapewniają dodatkową możliwość interakcji z klientami za pośrednictwem komunikatorów typu Telegram, WhatsApp, Viber i innych. Czasami wygodniej jest użytkownikom skorzystać z tej metody. Na przykład, aby otrzymywać różne przypomnienia, informacje o dostępności interesującego produktu w sklepie lub o przybyciu dostawy Kurtera. Oczywiście świadczymy również usługi tworzenia chatbotów.' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Чат-боти надають додаткову можливість взаємодії з клієнтами у месенджерах, таких як Telegram, WhatsApp, Viber та інші. Іноді користувачам зручніше користуватися саме в такий спосіб. Напимер для отримання різних нагадувань, інформації про появу товару, що цікавить, в магазині, або про прибуття куртерської доставки. І, природно, ми також надаємо послуги зі створення чат-ботів.' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Чат-боты предостввляют дополнительную возможность взаимодействия с клиентами в мессенджерах, таких как Telegram, WhatsApp, Viber и другие. Иногда пользователям удобней пользоваться именно таким способом. Напимер для получения различных напоминаний, информации о появлении интересующего товара в магазине, или о прибытии куртерской доставки. И естественно, мы также оказываем услуги по созданию чат-ботов.' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'Chatbots provide an additional opportunity to interact with customers in messengers such as Telegram, WhatsApp, Viber and others. Sometimes it is more convenient for users to use this method. For example, to receive various reminders, information about the availability of a product of interest in the store, or about the arrival of a Kurter delivery. And of course, we also provide services for creating chatbots.' : "")
                        }
                    />

                    <Razdel
                        prop_id="id_scrollBlock_07"
                        imgSrc="noReactStaticFiles/img/card_img_07.jpg"
                        razdelHeader={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'WEB-3, Blockchains, Smart Contracts' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'WEB-3, blockchainy, inteligentne kontrakty' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'WEB-3, блокчейни, смартконтракти' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'WEB-3, блокчейны, смартконтракты' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'WEB-3, blockchains, smart contracts' : "")
                        }
                        textContent={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'Web-3-Technologien sorgen für eine dezentrale Informationsspeicherung und einen dezentralen Datenaustausch. Sowie die Interaktion zwischen Benutzern, beispielsweise gegenseitige Abrechnungen. Es gibt keinen zentralen Server, der Benutzerdaten verwaltet. Diese Funktion übernehmen Benutzerrechner, die alle Aktionen untereinander koordinieren und auch die Datensynchronisation durchführen.' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Technologie Web-3 zapewniają zdecentralizowane przechowywanie informacji i wymianę danych. A także interakcja między użytkownikami, na przykład wzajemne rozliczenia. Nie ma centralnego serwera zarządzającego danymi użytkowników. Funkcję tę pełnią komputery użytkowników, które koordynują ze sobą wszystkie działania, a także dokonują synchronizacji danych.' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Web-3 технології передбачають децентралізоване зберігання інформації та обмін даними. А також взаємодія користувачів між собою, наприклад, взаєморозрахунки. При цьому відсутній центральний сервер, який керує даними користувачів. Цю функцію виконують комп"ютери користувачів, які узгоджують всі дії між собою, а також синхронізують дані.' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Web-3 технологии предусматривают децентрализованное хранение информации и обмен данными. А также взаимодействие пользователей между собой, например взаиморасчеты. При этом отсутствует центральный сервер, который управляет данными пользователей. Эту функцию выполняют компьютеры пользователей, которые согласовывают все действия между собой, а также выполняют синхронизацию данных.' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'Web-3 technologies provide for decentralized information storage and data exchange. As well as interaction between users, for example, mutual settlements. There is no central server that manages user data. This function is performed by user computers, which coordinate all actions with each other and also perform data synchronization.' : "")
                        }
                    />

                    <Razdel
                        prop_id="id_scrollBlock_08"
                        imgSrc="noReactStaticFiles/img/card_img_08.jpg"
                        razdelHeader={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'Unser Team:' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Nasz zespół:' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Наша команда:' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Наша команда:' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'Our team:' : "")
                        }
                        textContent={""}
                        additionalBlock={<TeamContenner />}
                    />

                    <Razdel
                        prop_id="id_scrollBlock_09"
                        imgSrc=""
                        razdelHeader={
                            // Языковой блок    
                            ((current_language_DISPATCH == "de") ? 'Kontakte:' : "")
                            +
                            ((current_language_DISPATCH == "pl") ? 'Łączność:' : "")
                            +
                            ((current_language_DISPATCH == "ua") ? 'Контакти:' : "")
                            +
                            ((current_language_DISPATCH == "ru") ? 'Контакты:' : "")
                            +
                            ((current_language_DISPATCH == "en") ? 'Contacts:' : "")
                        }
                        additionalBlock={
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <p>Deutschland: +49 151 123-45-67</p>
                                <p>Polska: +48 151 123-45-67</p>
                                <p>Україна: +38 151 123-45-67</p>
                                <p></p>
                                <p>Email: qqwewewew@asasd.assd</p>
                                <p>Telegram: wew@asasd.assd</p>
                                <p>Viber: wew@asasd.assd</p>
                                <p>WhatsUp: wew@asasd.assd</p>
                            </div>
                        }
                    />

                </div>
            </div >


            {/* Это блок с фоновым изображением */}


            <div className='backgroundFoneBlock'
                id='id_backgroundFoneBlock'
                style={{
                    position: 'fixed',
                    display: "block",
                    left: 0,
                    top: 0,
                    // height: "100vh",
                    height: document.documentElement.clientHeight,
                    width: "100vw",
                    zIndex: -2,
                    overflow: "hidden",
                    background: "black",
                }}
            >

                <video
                    style={{ position: 'absolute' }}
                    id='id_video'
                    src="noReactStaticFiles/img/particles_-_323 (Original).mp4"
                    // src="noReactStaticFiles/img/plexus_-_27669 (1080p).mp4"
                    // src="noReactStaticFiles/img/space_-_2381 (720p).mp4"

                    autoPlay // автовоспроизвеление
                    muted // выключение звука
                    loop // автоповтор
                />

                <div id='fone_ekran_NainFixed'
                    style={{
                        display: "block",
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: "100vw",
                        height: "100vh",
                        zIndex: -1,
                        // background: "rgba(0, 0, 0, 0.6)", 
                    }}
                >
                </div>

            </div>

        </div >
    )

    function setPosibilityScroll(value) {
        if (value == false) {
            // блокируем скроллинг
            isPossibleScrolling = false;
            // Отключаем скроллинr в CSS-стиле для элемента
            //   ref_scrollContenner.current.style.overflowY = "hidden";
            // устанавливаем правый отступ для компенсации исчезнувшей полосы прокрутки
            //   ref_scrollContenner.current.style.marginRight = (wightScrollingField) + "px";
        }

        //важно использовать  else if, поскольку в предыдущей инструкции переменная value устанавливается в положение true, что приведет к оюязательному выполнению слкд инструкции
        else if (value == true) {
            // восстанавливаем скроллинг
            isPossibleScrolling = true;
            //    ref_scrollContenner.current.style.overflowY = "scroll";
            //    ref_scrollContenner.current.style.marginRight = 0;
        }
    }

    // НЕ УДАЕТСЯ НАСТРОИТЬ СЛЕД ФУН ПОД ИСПОЛЬЗОВАНИЕ ТАЧПАДА
    function scrollingMouse(e) {
        // console.log("Start scrollingMouse");
        // console.log(e);
        //console.log(e.deltaY);
        //console.log(e.timeStamp);
        // console.log("isScrollingRun= " + isScrollingRun);
        //if (isPossibleScrolling == false) return;
        // Прерываем, если не закончился предыдцщийй скролл
        if (isScrollingRun) return;
        // Прерываем, если не продолжается предыдущий скролл
        /* 
                if ((e.timeStamp - timePreviosMouseScroll) < 200) {
                    console.log("Прерываем, e.timeStamp-timePreviosMouseScroll= " + (e.timeStamp - timePreviosMouseScroll));
                    return;
                }
                 */
        // определяем направления вращения колесика мыши
        let vectorRoute = null;
        // в зависимости от того - было ли прокручивание колесика мыши или касание пальцем по экрану смартфона - определяем направление прокрутки
        // eсли в событии присутствует значение deltaY - тогда это действие мыши
        if (e.deltaY) {
            vectorRoute = ((e.deltaY > 0) ? 1 : -1);
        }
        // если присутствует значение changedTouches - тогда это действий касания по точпаду ноутбука или экрану телефона
        if (e.changedTouches) {
            const x2_onTouch = e.changedTouches[0].clientX;
            const y2_onTouch = e.changedTouches[0].clientY;

            // предусматриваем прерывание функции
            if ((!x1_onTouch || !y1_onTouch)) return;

            const delta_X_onTouch = x2_onTouch - x1_onTouch;
            const delta_Y_onTouch = y2_onTouch - y1_onTouch;

            // предусматриваем прерывание функции
            if (
                // если скроллинг горизонтальный
                (Math.abs(delta_Y_onTouch) < Math.abs(delta_X_onTouch))
                // или скроллинг слишком короткий
                //    || (Math.abs(delta_Y_onTouch) < 50)
                // или слишком долгое движение
                || ((Date.now - timeStartTouch) < 1000)
            ) {
                // console.log("Прерываем вертикальный скроллинг");
                return;
            }

            // далее определяем направление движения
            vectorRoute = ((delta_Y_onTouch < 0) ? 1 : -1);
        }
        // console.log("vectorRoute=" + vectorRoute);
        // к текущему индексу активного блока прибавлям (отнимаем) вектор
        // предваритьельно определяем условно индекс текущего блока. Используем нумерованное окончание в названиях id-блоков
        let currentPsevdoIndex = currentActiveScrollingBlockValue_DISPATCH[currentActiveScrollingBlockValue_DISPATCH.length - 2] + currentActiveScrollingBlockValue_DISPATCH[currentActiveScrollingBlockValue_DISPATCH.length - 1];
        // Преобразовываем строку в число
        currentPsevdoIndex = Number(currentPsevdoIndex);
        // ороределяем прсевдо-индекс след эдемента для перехода по скроооингу
        let newPsevdoIndex = String(currentPsevdoIndex + vectorRoute);
        // добавляем нуль перед цифрой, если число оказалось с одним знаком. Поскольку номер блоков мы установили двузначными - 01, 02 и т.п.
        if (newPsevdoIndex.length < 2) {
            newPsevdoIndex = "0" + newPsevdoIndex;
        };
        // формируем имя искомой закладки след эдемента для перехода по скроооингу
        let lookingBookmarkIDname = "id_scrollBlock_" + newPsevdoIndex;

        // console.log("listScrollBlocksFinedObjects= " + listScrollBlocksFinedObjects[lookingBookmarkIDname]);

        // осуществляем переход по ссылке
        if (listScrollBlocksFinedObjects[lookingBookmarkIDname]) {
            isPossibleScrolling = false;
            listScrollBlocksFinedObjects[lookingBookmarkIDname].scrollIntoView();
        }
    }

    function finalScrollingPass() {
        // console.log("RUN finalScrollingPass");
        if (isScrollingRun == true) return;
        if (isPossibleScrolling == false) return;

        if (listScrollBlocksFinedObjects[globStateMirror.currentActiveScrollingBlockValue__FromReduxReadOnly]) {
            isPossibleScrolling = false;

            listScrollBlocksFinedObjects[globStateMirror.currentActiveScrollingBlockValue__FromReduxReadOnly].scrollIntoView();

            setInterval(() => {
                isPossibleScrolling = true;
            }, 100);

        }
    }

    function gorizontal_changedTouches(e) {
        // console.log(e);
        // Прерываем, если отсутствует признак действия от касания пальцем по экрану
        if (!e.changedTouches) return;
        // Прерываем, если отсутствуют координаты первого касания по экрану перед прокруткой
        if ((!x1_onTouch || !y1_onTouch)) return;

        const x2_onTouch = e.changedTouches[0].clientX;
        const y2_onTouch = e.changedTouches[0].clientY;
        const delta_X_onTouch = x2_onTouch - x1_onTouch;
        const delta_Y_onTouch = y2_onTouch - y1_onTouch;

        //  console.log("delta_X_onTouch= " + delta_X_onTouch);
        //  console.log("current_isOpenMobileMenu_DISPATCH= " + String(current_isOpenMobileMenu_DISPATCH));
        //  console.log("current_isOpenMobileMenu__FromReduxReadOnly= " + String(globStateMirror.current_isOpenMobileMenu__FromReduxReadOnly));

        // предусматриваем прерывание функции
        if (
            // если скроллинг вертикальный
            (Math.abs(delta_Y_onTouch) > Math.abs(delta_X_onTouch))
            // или скроллинг слишком короткий
            || (Math.abs(delta_X_onTouch) < 30)
            // или слишком долгое движение
            || ((Date.now - timeStartTouch) < 1000)
        ) {
            // console.log("Прерываем");
            return;
        }

        // если движение вправо - раскрываем меню
        if (
            (delta_X_onTouch > 0)
            &&
            //важно - используем значение из глобального зеркала, тк функция вызывается не из Хука, и за его пределами
            //(globStateMirror.current_isOpenMobileMenu__FromReduxReadOnly == false)

            (current_isOpenMobileMenu_DISPATCH == false)
        ) globCallbacksForSetStateRedux.mSet_isOpenMobileMenu_Redux(true);

        // если движение влево - сворачиваем меню
        else if (
            (delta_X_onTouch < 0)
            &&
            //важно - используем значение из глобального зеркала, тк функция вызывается не из Хука, и за его пределами
            // (globStateMirror.current_isOpenMobileMenu__FromReduxReadOnly == true)

            (current_isOpenMobileMenu_DISPATCH == true)
        ) globCallbacksForSetStateRedux.mSet_isOpenMobileMenu_Redux(false);
    }
}

function Razdel(props) {

    const current_mobileStatus_DISPATCH = useSelector(mState => mState.mobileStatus_Slice.current_mobileStatus);

    // созжаем обсервер - набоюдение зв скроллингом
    const { ref, inView, entry } = useInView(
        {
            // root: ref_scrollContenner.current,
            root: GlobData.ref_scrollContenner.current,
            threshold: 0.55,
        }
    )
    // тут реагируем на изменение активного раздеоа
    useEffect(() => {
        if (inView) {
            if (entry) {
                // console.log(entry.target.id);
                globCallbacksForSetStateRedux.mSet_currentActiveScrollingBlockValue_Redux(entry.target.id);
                wasReadingBlocksList.add(entry.target.id);

                if (listScrollBlocksFinedObjects[entry.target.id]) {
                    // listScrollBlocksFinedObjects[entry.target.id].scrollIntoView();
                }
            }
        }
    }, [inView])

    return (
        <div className='singleScrollingContenner'
            id={props.prop_id}
            ref={ref}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: "100%",
                minHeight: "100%",
                // borderBottom: "solid 1px gray",
                border: "solid 1px gray",
                borderRadius: "40px",
                padding: "20px",
                // marginBottom: "40px",
            }}
        >

            <div className='insideContentBlock'
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    // мобильная корректировка:
                    flexDirection:
                        current_mobileStatus_DISPATCH
                            ? 'column'
                            : 'column', // 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: "100%",
                    width: "100%",
                    border: "solid 1px grey",
                    borderRadius: "40px",
                    padding: "20px",
                    overflow: "hidden",
                }}
            >
                <div className='cardImageBlock'
                    style={
                        props.imgSrc
                            ? {
                                display: 'block',
                                // float: "left",
                                height: "300px",
                                // мобильная корректировка:
                                height:
                                    current_mobileStatus_DISPATCH
                                        ? '200px'
                                        : '300px', // 'row',
                                // maxHeight: "100px",
                                // width: "100px",
                                // minWidth: "100px",
                                borderRadius: "10px",
                                margin: "10px",
                                overflow: "hidden",
                            }
                            : { display: "none" }
                    }
                >
                    <img
                        src={props.imgSrc}
                        height="100%"
                    // width="100%"
                    />
                </div>

                <h3>  {props.razdelHeader}  </h3>

                <div className='effectForingContenner'
                    style={{
                        position: "relative",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        border: "solid 2px red",
                    }}
                >
                    <div className='effectInsideBlock'
                        style={{
                            position: "absolute",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            overflow: "hidden",
                            left: (entry && entry.target && wasReadingBlocksList.has(entry.target.id))
                                ? 0
                                : "50%",

                            opacity: (entry && entry.target && wasReadingBlocksList.has(entry.target.id))
                                ? 1
                                : 0.2,

                            transitionProperty: "left, opacity", // тут пкречисляем свойства
                            transitionDuration: "1s, 1.5s", // тут в такой же последовательности перечисояем время срабатывания выше указанных свойств
                        }}
                    >

                        <p>
                            {props.textContent}
                        </p>

                        {props.additionalBlock}

                    </div>

                </div>

            </div>

        </div >
    )

}

function CommandCard(props) {
    return (
        <div className='CommandCard'
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: "20px",
                marginBottom: "20px",
            }}
        >

            <div className='cardImageBlock'
                style={{
                    display: 'block',
                    height: "150px",
                    borderRadius: "10px",
                    margin: "10px",
                    overflow: "hidden",
                }}
            >
                <img
                    src={props.imgSrc}
                    height="100%"
                />
            </div>

            <div className='cardTextBlock'
                style={{
                    display: 'flex',
                    justifyContent: "center",
                    textAlign: "center",
                    overflow: "hidden",
                }}
            >
                {props.text}
            </div>
        </div>
    )
}

function TeamContenner() {
    return (
        <div className='TeamContenner'
            style={{
                display: "flex",
                flexDirection: "row",
                maxWidth: "100%",
                overflowX: "scroll",
                overflowY: "hidden",
                margin: "10px",
            }}

            onScrollCapture={(e) => {
                e.stopPropagation();
            }}

            onWheelCapture={(e) => {
                e.stopPropagation();
            }}

            onTouchMoveCapture={(e) => {
                e.stopPropagation();
            }}
        >

            < CommandCard
                imgSrc="noReactStaticFiles/img/face-01.jpg"
                text={
                    <div>
                        <p> Иван Данилишин, <br />
                            web-разработчик
                        </p>
                    </div>
                }
            />

            < CommandCard
                imgSrc="noReactStaticFiles/img/face-02.jpg"
                text={
                    <div>
                        <p> Петр Квашин, <br />
                            web-разработчик
                        </p>
                    </div>
                }
            />

            < CommandCard
                imgSrc="noReactStaticFiles/img/face-03.jpg"
                text={
                    <div>
                        <p> Петр Квашин, <br />
                            web-разработчик
                        </p>
                    </div>
                }
            />

            < CommandCard
                imgSrc="noReactStaticFiles/img/face-04.jpg"
                text={
                    <div>
                        <p> Петр Квашин, <br />
                            web-разработчик
                        </p>
                    </div>
                }
            />

            < CommandCard
                imgSrc="noReactStaticFiles/img/face-05.jpg"
                text={
                    <div>
                        <p> Петр Квашин, <br />
                            web-разработчик
                        </p>
                    </div>
                }
            />

            < CommandCard
                imgSrc="noReactStaticFiles/img/face-06.jpg"
                text={
                    <div>
                        <p> Петр Квашин, <br />
                            web-разработчик
                        </p>
                    </div>
                }
            />

            < CommandCard
                imgSrc="noReactStaticFiles/img/face-07.jpg"
                text={
                    <div>
                        <p> Петр Квашин, <br />
                            web-разработчик
                        </p>
                    </div>
                }
            />

        </div>
    )
}

//---------------------------
export default Main;