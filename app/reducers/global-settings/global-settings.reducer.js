import { combineReducers } from 'redux';
import { GET_GLOBAL_SETTINGS_REQUEST, GET_GLOBAL_SETTINGS_SUCCESS } from '../../types/global-settings.types';

const forcedUpgrade = (state = {}, action) => {
    switch (action.type) {
        case GET_GLOBAL_SETTINGS_SUCCESS:
            if (!action.payload) {
              return state;
            }
            const { forcedUpgrade: settingsForcedUpgrade } = action.payload;
            return { ...state, ...settingsForcedUpgrade };

        default:
            return state;
    }
};

const latestVersion = (state = '', action) => {
    switch (action.type) {
        case GET_GLOBAL_SETTINGS_SUCCESS:
            if (!action.payload) {
              return state;
            }
            const { latestVersion: settingsLatestVersion } = action.payload;
            return `${settingsLatestVersion}`;
        default:
            return state;
    }
};

const loaded = (state = false, action) => {
    switch (action.type) {
        case GET_GLOBAL_SETTINGS_REQUEST:
            return false;
        case GET_GLOBAL_SETTINGS_SUCCESS:
            return true;
        default:
            return state;
    }
};

export default combineReducers({
    forcedUpgrade,
    latestVersion,
    loaded
});
