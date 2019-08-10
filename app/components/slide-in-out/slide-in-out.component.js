import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Animated, Dimensions } from 'react-native';

const WINDOW_WIDTH = Dimensions.get('window').width;

class SlideInOut extends Component {
    state = {
        slideAnim: new Animated.Value(this.props.slideDistance)
    }

    componentDidMount() {
        if (this.props.visible) {
            this.slideIn();
        }
    }

    componentWillReceiveProps({ visible }) {
        if (this.previouslyInvisible(visible)) {
            this.slideIn();
        } else if (this.previouslyVisible(visible)) {
            this.slideOut();
        }
    }
    
    previouslyInvisible = (visible) => {
        return !this.props.visible && visible;
    }

    previouslyVisible = (visible) => {
        return this.props.visible && !visible;
    }

    slideIn = () => {
        Animated.spring(this.state.slideAnim, {
            toValue: 0,
            duration: 300
        }).start();
    }

    slideOut = () => {
        Animated.spring(this.state.slideAnim, {
            toValue: this.props.slideDistance,
            duration: 300
        }).start();
    }

    render() {
        return (
            <Animated.View 
                style={[this.props.styles, {
                    transform: [
                        { translateX: this.state.slideAnim }
                    ]
                }]}
            > 
                { this.props.children }
            </Animated.View>
        );
    }
}

SlideInOut.propTypes = {
    slideDistance: PropTypes.number,
    styles: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.object
    ]),
    visible: PropTypes.bool.isRequired
};

SlideInOut.defaultProps = {
    slideDistance: WINDOW_WIDTH,
    styles: {},
    visible: false
};

export default SlideInOut;

