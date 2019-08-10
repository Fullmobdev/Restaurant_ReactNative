import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { PanResponder, View } from 'react-native';

class  SwipeUpView extends Component {
    panResponder = {};
    
    componentDidMount() {
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderGrant: this.onPanResponderGrant,
            onPanResponderMove: this.onPanResponderMove,
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: this.onPanResponderRelease,
            onPanResponderTerminate: this.onPanResponderTerminate
        });
    }

    onPanResponderGrant = (evt, gestureState) => { this.props.onGrant(); }
    onPanResponderMove = (evt, gestureState) => {
        const { dy } = gestureState;
        const { onSwipeUp, onSwipeUpMove, swipeUpThreshold } = this.props;
        onSwipeUpMove(evt, gestureState);

        if (dy < (-1 * swipeUpThreshold)) {
            onSwipeUp();
        }
    }

    onPanResponderRelease = (evt, gestureState) => {
        this.props.onSwipeUpRelease(evt, gestureState);
    }

    onPanResponderTerminate = (evt, gestureState) => {}

    render() {
        const { children, styles } = this.props;
        return (
            <View 
                style={styles}
                {...this.panResponder.panHandlers}
            >
                { children }
            </View>
        );
    }
}

SwipeUpView.defaultProps = {
    onGrant: () => {},
    onSwipeUp: () => {},
    onSwipeUpMove: () => {},
    onSwipeUpRelease: () => {},
    swipeUpThreshold: 100
};

SwipeUpView.propTypes = {
    onGrant: PropTypes.func,
    onSwipeUp: PropTypes.func,
    onSwipUpMove: PropTypes.func,
    onSwipeUpRelease: PropTypes.func,
    styles: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    swipeUpThreshold: PropTypes.number
};

export default SwipeUpView;

