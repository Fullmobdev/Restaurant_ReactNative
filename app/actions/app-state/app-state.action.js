import * as types from '../../types/app-state.types';
import { goOffline, goOnline } from '../../services/db-access.service';

export const setAppRunningState = (state) => {
    return {
        type: types.APP_RUNNING_STATE_CHANGE,
        payload: state
    };
};

export const setNetworkConnectionType = (state) => {
    return (dispatch, getState) => {
        const { appState } = getState();
        const { connectionType } = appState;

        if (state === types.ConnectionType.none &&
            connectionType !== state) {
                goOffline();
        } else if (connectionType === types.ConnectionType.none &&
            connectionType !== state) {
                goOnline();
            }

        dispatch({
            type: types.NETWORK_CONNECTION_TYPE_CHANGE,
            payload: state
        });
    };
};
