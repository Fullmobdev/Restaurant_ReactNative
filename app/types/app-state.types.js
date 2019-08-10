export const APP_RUNNING_STATE_CHANGE = 'app_running_state_change';
export const NETWORK_CONNECTION_TYPE_CHANGE = 'network_connection_type_change';

export const AppRunningState = {
    active: 'active',
    background: 'background',
    inactive: 'inactive'
};

export const ConnectionType = {
    none: 'none',
    unknown: 'UNKNOWN'
};

export const hasConnection = connectionType => {
    return (connectionType !== ConnectionType.none)
        && (connectionType !== ConnectionType.unknown);
};
