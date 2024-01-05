import { createReducer, createSlice, combineReducers, configureStore } from '@reduxjs/toolkit';

// тут храним копии состояний редакса
export const globStateMirror = {
    current_isOpenMobileMenu__FromReduxReadOnly: false,
    currentActiveScrollingBlockValue__FromReduxReadOnly: "01",
};
// тут храним колбеки для изменения состояний
export const globCallbacksForSetStateRedux = {};

//------------------------------------
const colorTeam_Slice = createSlice({
    // название
    name: "colorTeam_Slice",
    // начальное значение
    initialState: {
        colorTeam_number: 1,
        colorTeam_comments: "white",
    },
    // список экшинов
    reducers: {
        mSet_colorTeam_number(state, action) {
            let newState = state.colorTeam_number + action.payload;
            state.colorTeam_number = newState;
            // копируем в globStateMirror
            globStateMirror.colorTeam_number__FromReduxReadOnly = newState;
        },
        mChange_colorTeam(state) {
            let newState = state.colorTeam_number + 1;
            if (newState > 4) newState = 1;
            state.colorTeam_number = newState;
            // копируем в globStateMirror
            globStateMirror.colorTeam_number__FromReduxReadOnly = newState;
        }
    }
});

//------------------------------------
const mobileStatus_Slice = createSlice({
    // название
    name: "mobileStatus_Slice",
    // начальное значение
    initialState: {
        current_mobileStatus: 0,
    },
    // список экшинов
    reducers: {
        mSet_current_mobileStatus_Slice(state, action) {
            state.current_mobileStatus = action.payload;
            // копируем в globStateMirror
            globStateMirror.current_mobileStatus__FromReduxReadOnly = action.payload;
        },
    }
});

//------------------------------------
const isOpenMobileMenu_Slice = createSlice({
    // название
    name: "isOpenMobileMenu_Slice",
    // начальное значение
    initialState: {
        current_isOpenMobileMenu: false,
    },

    // список экшинов
    reducers: {
        mSet_current_isOpenMobileMenu_Slice(state, action) {
            // console.log("Сработал mSet_current_isOpenMobileMenu_Slice");

            state.current_isOpenMobileMenu = action.payload;
            // копируем в globStateMirror
            globStateMirror.current_isOpenMobileMenu__FromReduxReadOnly = action.payload;
        },
    }
});

//------------------------------------
const language_Slice = createSlice({
    // название
    name: "language_Slice",
    // начальное значение
    initialState: {
        current_language: "en",
        language_list: ["en", "de", "pl", "ua", "ru"],
    },
    // список экшинов
    reducers: {
        mSet_current_language_Slice(state, action) {
            state.current_language = action.payload;
            // копируем в globStateMirror
            globStateMirror.current_language__FromReduxReadOnly = action.payload;
        },
    }
});
//------------------------------------
const currentActiveScrollingBlockValue_Slice = createSlice({
    // название
    name: "currentActiveScrollingBlockValue_Slice",
    // начальное значение
    initialState: {
        currentActiveScrollingBlockValue: "01",
    },
    // список экшинов
    reducers: {
        mSet_currentActiveScrollingBlockValue_Slice(state, action) {
            state.currentActiveScrollingBlockValue = action.payload;
            // копируем в globStateMirror
            globStateMirror.currentActiveScrollingBlockValue__FromReduxReadOnly = action.payload;
        },
    }
});

//------------------------------------
//------------------------------------
//------------------------------------
// Групповой редююер
const combineReducers_01 = combineReducers({
    // тут важно - из colorTeam_Slice извлекаем обьект reducer
    colorTeam_Slice: colorTeam_Slice.reducer,

    mobileStatus_Slice: mobileStatus_Slice.reducer,

    isOpenMobileMenu_Slice: isOpenMobileMenu_Slice.reducer,

    language_Slice: language_Slice.reducer,

    currentActiveScrollingBlockValue_Slice: currentActiveScrollingBlockValue_Slice.reducer,
})

//------------------------------------
// Глоб редююер (является оболочкой для обьекта provider в приложении)
export const GlobStore = configureStore({
    reducer: combineReducers_01,
});
//------------------------------------

// созданные экщины группируем в обхект и экспортируем 
export const mReduxActionsListObject = {
    mSet_colorTeam_number: colorTeam_Slice.actions.mSet_colorTeam_number,
    mChange_colorTeam: colorTeam_Slice.actions.mChange_colorTeam,

    mSet_current_mobileStatus_Slice: mobileStatus_Slice.actions.mSet_current_mobileStatus_Slice,

    mSet_isOpenMobileMenu_Slice: isOpenMobileMenu_Slice.actions.mSet_current_isOpenMobileMenu_Slice,

    mSet_current_language_Slice: language_Slice.actions.mSet_current_language_Slice,

    mSet_currentActiveScrollingBlockValue_Slice: currentActiveScrollingBlockValue_Slice.actions.mSet_currentActiveScrollingBlockValue_Slice,
}




