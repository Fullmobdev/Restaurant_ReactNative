import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';

import Colors from '../../../styles/colors.styles';

const WINDOW_WIDTH = Dimensions.get('window').width;

class SlideInShrinkBorderAnim extends Component {
    state = {
        slideInAnim: new Animated.Value(WINDOW_WIDTH),
        shrinkLeftBorderAnim: new Animated.Value(WINDOW_WIDTH)
    }

    componentDidMount() {
        if (this.props.runAnimation) { this.startAnimation(); }
    }

    componentWillReceiveProps({
        runAnimation
    }) {
        if (this.shouldRunAnimation(this.props.runAnimation, runAnimation)) {
            this.resetAnimation();
        }
    }

    shouldComponentUpdate({ runAnimation }, nextState) {
        return this.shouldRunAnimation(this.props.runAnimation, runAnimation);
    }

    componentDidUpdate() {
        this.startAnimation();
    }

    shouldRunAnimation(previousRunAnimationVal, currentRunAnimationVal) {
        return (!previousRunAnimationVal && currentRunAnimationVal);
    }

    startAnimation() {
        const { shrinkLeftBorderAnim, slideInAnim } = this.state;

        Animated.sequence([
            Animated.delay(300),
            Animated.stagger(100, [
                Animated.timing(
                    slideInAnim,
                    {
                        toValue: 0,
                        duration: 250
                    }
                ),
                Animated.timing(
                    shrinkLeftBorderAnim,
                    {
                        toValue: 10,
                        duration: 150
                    }
                )
            ])
       ]).start();

       if (this.props.onAnimationRun) { this.props.onAnimationRun(); }
    }

    resetAnimation() {
        this.state.slideInAnim.setValue(WINDOW_WIDTH);
        this.state.shrinkLeftBorderAnim.setValue(0);
    }

    render() {
        const { shrinkLeftBorderAnim, slideInAnim } = this.state;

        return (
            <Animated.View
                style={[styles.slideContainer, {
                    transform: [
                        { translateX: slideInAnim }
                    ]
                }]}
            >
                <Animated.View
                    style={[styles.leftBorder, {
                        width: shrinkLeftBorderAnim
                    }]}
                />
                { this.props.children }
            </Animated.View>
        );
    }
}

SlideInShrinkBorderAnim.propTypes = {
    runAnimation: PropTypes.bool,
    onAnimationRun: PropTypes.func
};

const styles = StyleSheet.create({
    leftBorder: {
        backgroundColor: Colors.ViewsBlue
    },
    slideContainer: {
        flexDirection: 'row',
        paddingHorizontal: 30
    }
});

export default SlideInShrinkBorderAnim;
