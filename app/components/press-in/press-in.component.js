import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Animated, StyleSheet, TouchableWithoutFeedback } from 'react-native';

class PressIn extends Component {
    state = {
        scaleInAnim: new Animated.Value(1)
    }

    handlePressIn = () => {
        this.startPressInAnimation();
    }

    handlePressOut = () => {
        this.startPressOutAnimation();
    }

    startPressInAnimation = () => {
        Animated.spring(this.state.scaleInAnim, {
            toValue: 0.95,
            duration: 100
        }).start();
    }

    startPressOutAnimation = () => {        
        Animated.spring(this.state.scaleInAnim, {
            toValue: 1,
            duration: 100
        }).start();
    }

    render() {
        const { scaleInAnim } = this.state;
        const { children, style, onPress } = this.props;

        const viewStyle = [style, {
                transform: [
                    { scaleX: scaleInAnim }, 
                    { scaleY: scaleInAnim }
                ]
            }
        ];

        return (
            <TouchableWithoutFeedback
                onPress={onPress}
                onPressIn={this.handlePressIn}
                onPressOut={this.handlePressOut}
            >
                <Animated.View style={viewStyle}>
                    { children }
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    }
}

PressIn.propTypes = {
    onPress: PropTypes.func,
    style: PropTypes.oneOfType([PropTypes.number, PropTypes.object])
};

PressIn.defaultProps = {
    onPress: () => {},
    style: {}
};

const styles = StyleSheet.create({
});

export default PressIn;
