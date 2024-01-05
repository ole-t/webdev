
import { globCallbacksForSetStateRedux, globStateMirror } from "./store/globStore.js";


//----------------------------

class GlobFunctions {


    // Эта функция не просто определяет язык браузера по умолчанию, но еще - при отсутсвии предусмотренных языков - возвращает английский язык.
    getDefault_languageFromBrowser() {
        let returnLanguage = "en";
        /* 
            var language = window.navigator ? (window.navigator.language || window.navigator.systemLanguage || window.navigator.userLanguage) : "ru";
            language = language.substr(0, 2).toLowerCase();
            return language;
         */

        let brouserDefaultLanguage = navigator.language || navigator.userLanguage;
        // console.log("Язык браузера по умолчанию= " + brouserDefaultLanguage);
        brouserDefaultLanguage = brouserDefaultLanguage.substr(0, 2).toLowerCase();
        // console.log("Язык браузера по умолчанию после сокращения= " + brouserDefaultLanguage);
        // далее проверяем - тмеется ли данный язык в используемых нами в интерфейсе
        try {
            switch (brouserDefaultLanguage) {
                case "de":
                    returnLanguage = "de";
                    break;

                case "pl":
                    returnLanguage = "pl";
                    break;

                case "ua":
                    returnLanguage = "uk";
                    break;

                case "ru":
                    returnLanguage = "ru";
                    break;

                default:
                    returnLanguage = "en"
                    break;
            }

        } catch (error) {
            console.log(error);
        }

        return returnLanguage;
    }

    // --------------------------------

    setlanguageChoosed(value) {
        console.log("Запуск setlanguageChoosed, value=" + value)
        // сохраняем в Редакс
        globStateMirror.set_languageChoosed_Redux(value);
        // сохраняем в localStorage
        globStateMirror.locStorData.languageChoosed = value;
        // mLocalStorage.saveLocalStorageBis();
    }

    // --------------------------------
    mediaAdapter() {
        // Доступное описание размеров окна см. тут: https://habr.com/ru/articles/509258/
        // Запрет разворота экрана - см тут: https://ru.stackoverflow.com/questions/379391/%D0%97%D0%B0%D0%BF%D1%80%D0%B5%D1%82%D0%B8%D1%82%D1%8C-%D0%BF%D0%BE%D0%B2%D0%BE%D1%80%D0%BE%D1%82-activity-%D0%B8-%D0%B2%D1%81%D0%B5%D0%B3%D0%BE-%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F

        // console.log("Запуск mediaAdapter");

        let monitorHeight = window.screen.availHeight;
        let monitorWidth = window.screen.availWidth;
        let clientHeight = document.documentElement.clientHeight;
        let clientWidth = document.documentElement.clientWidth;
        let windowOrientation = (clientWidth < clientHeight) ? "vertical" : "gorizontal";

        let mobilAdaptationName = 0;
        if (clientWidth < 900) mobilAdaptationName = "mobilAdaptationName_01";

        globStateMirror.mediaAdaptionData_VECTOR = {
            monitorWidth: monitorWidth,
            monitorHeight: monitorHeight,
            clientWidth: clientWidth,
            clientHeight: clientHeight,

            windowOrientation: windowOrientation,
            mobilAdaptationName: mobilAdaptationName,
        }

        // console.log("globStateMirror.mediaAdaptionData_VECTOR= ");
        // console.log(globStateMirror.mediaAdaptionData_VECTOR);

        globCallbacksForSetStateRedux.mSet_current_mobileStatus_Redux(mobilAdaptationName);

    }

    // --------------------------------
    videoMooveAdaption() {
        // console.log("Запуск videoMooveAdaption");
        // замедляем видео фона
        let mOobjVideo = document.getElementById("id_video");
        if (mOobjVideo) {
            mOobjVideo.playbackRate = 0.5;
            //   console.log(mOobjVideo);
            // масштабируем видео
            let koefVideo = 1280 / 720;
            let videoBlock = document.getElementById("id_App");
            //  console.log("videoBlock= ");
            //  console.log(videoBlock.clientHeight);
            let koefEkran = videoBlock.clientWidth / videoBlock.clientHeight;
            //   console.log("koefVideo= " + koefVideo);
            //   console.log("koefEkran= " + koefEkran);

            // сбрасываем размеры
            //   mOobjVideo.height = "auto";
            //   mOobjVideo.width = "auto";


            if (koefVideo > koefEkran) {
                mOobjVideo.height = videoBlock.clientHeight;
                // mOobjVideo.width = null;
            }
            else {
                // mOobjVideo.height = null;
                mOobjVideo.width = videoBlock.clientWidth;
            }
        }


    }

    //----------------------------
    myRandomId() {
        let dateNow = Date.now();
        let rndmNumb = Math.floor(Math.random() * 1000000000);
        let rndmSum = dateNow + '_' + rndmNumb;
        return (rndmSum);
    }
    //----------------------------
    adapting_Date(m_utc) {
        if (m_utc) return (new Date(m_utc).toLocaleDateString());
        else return null;
    }
    //----------------------------
    adapting_Time(m_utc) {
        if (m_utc) return (new Date(m_utc).toLocaleTimeString());
        else return null;
    }
}

//----------------------------
export default new GlobFunctions();