import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Animated, StyleSheet, TouchableWithoutFeedback } from 'react-native';

class FadeInOut extends Component {
    fadeOutTimeoutId = null;
    visible = true;
    state = {
        fadeInAnim: new Animated.Value(0)
    }

    componentDidMount() {
        this.fadeIn();
    }

    fadeIn = () => {
        if (this.fadeOutTimeoutId) {
            clearTimeout(this.fadeOutTimeoutId);
            this.fadeOutTimeoutId = null;
        }

        const { fadeInAnim } = this.state;
        Animated.timing(fadeInAnim, {
            toValue: 1,
            duration: 300,
            onComplete: () => {
                this.visible = true;
                this.fadeOutTimeoutId = setTimeout(this.fadeOut, 2000);
            },
            useNativeDriver: true
        }).start();
    }

    fadeOut = () => {
        const { fadeInAnim } = this.state;
        Animated.timing(fadeInAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            onComplete: () => {
                this.visible = false;
            }
        }).start();
    }

    handlePressIn = () => {
        this.fadeIn();     
    }

    handlePress = (event) => {
        if (this.visible) {
            this.props.onPress(event);
        }
    }

    handleLongPress = (event) => {
        if (this.visible) {
            this.props.onLongPress(event);
        }
    }

    render() {
        const { children } = this.props;
        const { fadeInAnim } = this.state;

        const style = [styles.container, {
            opacity: fadeInAnim
        }];

        return (
            <TouchableWithoutFeedback 
                onPressIn={this.handlePressIn}
                onPress={this.handlePress}
                onLongPress={this.handleLongPress}
            >
                <Animated.View style={style}>
                    {children}
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    }
}

FadeInOut.propTypes = {
    onPress: PropTypes.func,
    onLongPress: PropTypes.func
};

FadeInOut.defaultProps = {
    onPress: () => {},
    onLongPress: () => {} 
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        opacity: 0
    }
});

export default FadeInOut;
