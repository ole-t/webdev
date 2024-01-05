
import GlobData from "./GlobData.js";

//-----------------------------

class mLocalStorage {

    loadLocalStorageBis() {
        let data = localStorage.getItem('mLocalStorage');
        if (data) {
            GlobData.locStorData = JSON.parse(data);
        };
    }
    // --------------------------
    saveLocalStorageBis() {
        localStorage.setItem('mLocalStorage', JSON.stringify(GlobData.locStorData));
    }
    // --------------------------
    deleteLocaleStorageBis() {
        localStorage.removeItem('myLocalStorageBis');
    }

}

//-----------------------------

export default new mLocalStorage;