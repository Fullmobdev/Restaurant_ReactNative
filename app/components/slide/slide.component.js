import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Animated, StyleSheet } from 'react-native';

class Slide extends Component {
  state = {
    top: new Animated.Value(0),
    left: new Animated.Value(0)
  };

  componentDidMount() {
    const { startingPosition, endingPosition, horizontal, visible } = this.props;
    const top = visible ? startingPosition : endingPosition;
    const left = visible ? startingPosition : endingPosition;

    if (horizontal) {
      this.setState({ left: new Animated.Value(left) });
    } else {
      this.setState({ top: new Animated.Value(top) });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = this.props;

    if (visible && !nextProps.visible) {
      this.hide();
    } else if (!visible && nextProps.visible) {
      this.show();
    }
  }

  hide = () => {
    const { duration } = this.props;
    const position = horizontal ? 'left' : 'top';

    Animated.timing(this.state[position], {
      toValue: 100,
      duration
    }).start();
  };

  show = () => {
    const { duration } = this.props;
    const position = horizontal ? 'left' : 'top';

    Animated.timing(this.state[position], {
      toValue: 0,
      duration
    }).start();
  };

  renderPosition = (key, value) => {
    const { children, style, startingPosition, endingPosition } = this.props;
    return (
      <Animated.View
        style={[
          style,
          {
            [key]: value.interpolate({
              inputRange: [startingPosition, endingPosition],
              outputRange: [`${startingPosition}%`, `${endingPosition}%`],
              extrapolate: 'clamp'
            })
          }
        ]}
      >
        {children}
      </Animated.View>
    );
  };

  renderTranslate = (key, value) => {
    const { children, startingPosition, endingPosition, style } = this.props;
    return (
      <Animated.View
        style={[
          style,
          {
            transform: [
              {
                [key]: value.interpolate({
                  inputRange: [startingPosition, endingPosition],
                  outputRange: [startingPosition, endingPosition],
                  extrapolate: 'clamp'
                })
              }
            ]
          }
        ]}
      >
        {children}
      </Animated.View>
    );
  };

  render() {
    const { animatedValue, horizontal, translate } = this.props;
    const { left, top } = this.state;
    const positionKey = horizontal ? 'left' : 'top';
    const translateKey = horizontal ? 'translateX' : 'translateY';
    let value;

    if (animatedValue) {
      value = animatedValue;
    } else {
      value = horizontal ? left : top;
    }
    return translate
      ? this.renderTranslate(translateKey, value)
      : this.renderPosition(positionKey, value);
  }
}

Slide.defaultProps = {
  // Note: Moving this to the style sheet below results in it being undefined
  // when the default styles are calculated
  // style: StyleSheet.create({
  //     flex: 1
  // }),
  startingPosition: 0,
  duration: 300,
  endingPosition: 100,
  horizontal: false,
  translate: false,
  visible: false
};

Slide.propTypes = {
  animatedValue: PropTypes.object,
  startingPosition: PropTypes.number,
  duration: PropTypes.number,
  endingPosition: PropTypes.number,
  horizontal: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  translate: PropTypes.bool, // Note: Visibility won't be in effect if this is set
  visible: PropTypes.bool
};

export default Slide;
