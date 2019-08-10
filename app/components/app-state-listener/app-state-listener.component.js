import { Component } from 'react';
import { connect } from 'react-redux';
import { AppState, NetInfo } from 'react-native';

// Actions
import { setAppRunningState, setNetworkConnectionType }
from '../../actions/app-state/app-state.action';

class AppStateListener extends Component {
    componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);
        NetInfo.addEventListener('connectionChange', this.handleNetworkConnectionChange);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
        NetInfo.removeEventListener('connectionChange', this.handleNetworkConnectionChange);
    }

    handleAppStateChange = (nextAppState) => {
        const { appState, onAppRunningStateChange } = this.props;

        if (appState.runningState !== nextAppState) {
            onAppRunningStateChange(nextAppState);
        }
    }

    handleNetworkConnectionChange = (connectionType) => {
       this.props.onConnectionTypeChange(connectionType);
    };

    render() {
        return this.props.children;
    }
}

const mapStateToProps = (state) => {
    const { appState } = state;

    return {
        appState
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onAppRunningStateChange: (state) => dispatch(setAppRunningState(state)),
        onConnectionTypeChange: (state) => dispatch(setNetworkConnectionType(state))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppStateListener);
