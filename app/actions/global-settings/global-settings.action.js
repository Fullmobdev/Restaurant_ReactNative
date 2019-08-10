import * as types from '../../types/global-settings.types';
import { fetchGlobalSettings } from '../../services/global-settings/global-settings.service';

export const getGlobalSettings = () => {
    return (dispatch) => {
        dispatch(getGlobalSettingsRequest());

        fetchGlobalSettings()
        .then(settings => {
            dispatch(getGlobalSettingsSuccess(settings));
        })
        .catch((error) => {
            dispatch(getGlobalSettingsFailure(error));
        });
    };
};

export const getGlobalSettingsRequest = () => {
    return {
        type: types.GET_GLOBAL_SETTINGS_REQUEST
    };
};

const getGlobalSettingsSuccess = (payload) => {
    return {
        type: types.GET_GLOBAL_SETTINGS_SUCCESS,
        payload
    };
};

const getGlobalSettingsFailure = (error) => {
    return {
        type: types.GET_GLOBAL_SETTINGS_FAILURE,
        payload: error
    };
};
