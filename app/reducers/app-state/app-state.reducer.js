import { combineReducers } from 'redux';
import * as types from '../../types/app-state.types';

const runningState = (state = types.AppRunningState.active, action) => {
    switch (action.type) {
        case types.APP_RUNNING_STATE_CHANGE:
            return action.payload;
        default:
            return state;
    }
};

const connectionType = (state = types.ConnectionType.unknown, action) => {
    switch (action.type) {
        case types.NETWORK_CONNECTION_TYPE_CHANGE:
            return action.payload;
        default:
            return state;
    }
};

export default combineReducers({
    runningState,
    connectionType
});
