import React, { Component, PropTypes } from 'react';
import { TouchableWithoutFeedback, View, Animated } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

let cameraTimer = null; // Half a second or so timer before video starts
let videoCountdownTimer = null;

/**
 *                  API:
 *
 * You must implement the following callback props:
 * - buttonWasTapped
 * - buttonDidBeginLongPress
 * - buttonDidEndLongPress
 *
 * Optional props:
 * - progressLineWidth [default 3]
 * - progressLineColor [default 'red']
 * - progressLineBackgroundColor [default 'white']
 * - buttonSize [default 50]
 */

class CameraButton extends Component {
  /**
   * Lifecycle
   */
  constructor(props) {
    super(props);
    this.setDefaults();

    this.state = {
      fill: 0,
      buttonSize: new Animated.Value(this.props.buttonSize),
      innerCircleSize: new Animated.Value(0)
    };
    console.ignoredYellowBox = [
      'Warning: Failed prop type: Invalid prop `size` of type `object` supplied to `AnimatedCircularProgress`'
    ];
  }

  setDefaults = () => {
    this.userIsPressingIn = null;
    this.cameraTimerFinished = null;
    this.props.attemptSwitch;
    window.clearInterval(videoCountdownTimer);
    window.clearTimeout(cameraTimer);
  };

  /**
   * Call this from parent components to reset info about
   */
  resetState = () => {
    this.setState({ fill: 0 });
    this.state.buttonSize.setValue(this.props.buttonSize);
    this.state.innerCircleSize.setValue(0);
  };

  /**
   * On Press handlers (internal)
   */

  onPressIn = () => {
    this.userIsPressingIn = true;
    this.cameraTimerFinished = false;
    if (cameraTimer !== null) {
      window.clearTimeout(cameraTimer);
    }

    if (!this.props.functionalityDisabled) {
      cameraTimer = window.setTimeout(
        this.cameraTimerFinishedHandler,
        this.props.videoActivationDelay
      );
    }
  };

  onPressOut = () => {
    this.userIsPressingIn = false;

    if (this.cameraTimerFinished === true) {
      this.props.buttonDidEndLongPress();

      //Stop the button from growing
      Animated.timing(this.state.buttonSize).stop();
    } else if (this.cameraTimerFinished === false) {
      this.props.buttonWasTapped();
      //Stop inner (red) circle animation
      Animated.timing(this.state.innerCircleSize).stop();
    }

    this.setDefaults();
  };

  cameraTimerFinishedHandler = () => {
    this.animateInnerCircle();

    this.cameraTimerFinished = true;

    if (this.userIsPressingIn === true) {
      this.props.buttonDidBeginLongPress();
      this.animateButtonSize();
      const interval = this.props.videoTimeLimit / 100;
      videoCountdownTimer = window.setInterval(() => {
        const { fill } = this.state;
        if (fill < 100) {
          this.setState({ fill: this.state.fill + interval / 100 });
        } else {
          this.props.buttonDidEndLongPress();
          this.setDefaults();
        }
      }, interval);
    }
  };

  animateInnerCircle = () => {
    const { buttonSize } = this.props;
    // Start the inner red circle animation
    Animated.timing(this.state.innerCircleSize, {
      toValue: buttonSize,
      duration: 1000
    }).start();
  };

  animateButtonSize = () => {
    Animated.timing(this.state.buttonSize, {
      toValue: 1.5 * this.props.buttonSize,
      duration: 1000
    }).start();
  };

  render() {
    const { disabled, style } = this.props;
    const innerCircleAnimatedStyle = {
      position: 'absolute',
      backgroundColor: '#ff3366',
      height: this.state.innerCircleSize,
      width: this.state.innerCircleSize,
      borderRadius: this.state.innerCircleSize
    };
    const progressStyle = [style, { opacity: disabled ? 0.3 : 1 }];

    return (
      <TouchableWithoutFeedback 
        disabled={disabled}
        onPressOut={this.onPressOut} 
        onPressIn={this.onPressIn}
      >
        <View style={styles.container}>
          <AnimatedCircularProgress
            style={progressStyle}
            size={this.state.buttonSize}
            fill={this.state.fill}
            rotation={0}
            width={this.props.progressLineWidth || 3}
            tintColor={this.props.progressLineColor || 'red'}
            backgroundColor={this.props.progressLineBackgroundColor || 'white'}
          />
          <Animated.View style={innerCircleAnimatedStyle} />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = {
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  }
};

CameraButton.propTypes = {
  buttonWasTapped: PropTypes.func.isRequired,
  buttonDidEndLongPress: PropTypes.func.isRequired,
  buttonDidBeginLongPress: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  videoTimeLimit: PropTypes.number,
  videoActivationDelay: PropTypes.number,
  buttonSize: PropTypes.number,
  progressLineWidth: PropTypes.number,
  progressLineColor: PropTypes.string,
  progressLineBackgroundColor: PropTypes.string
};

CameraButton.defaultProps = {
  buttonWasTapped: () => {},
  buttonDidBeginLongPress: () => {},
  buttonDidEndLongPress: () => {},
  disabled: false,
  videoTimeLimit: 10000,
  videoActivationDelay: 500,
  buttonSize: 42,
  progressLineWidth: 3,
  progressLineColor: '#ff3366',
  progressLineBackgroundColor: 'white'
};

export default CameraButton;
