import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

class SlideUp extends Component {
  state = {
    startingPosition: 0
  };

  onLayout = ({ nativeEvent }) => {
    // this.setState({ startingPosition: nativeEvent.layout.height });
  };

  render() {
    const position = this.state.startingPosition || Dimensions.get('window').height;
    const { children, style, visible } = this.props;
    const viewStyles = visible
      ? [style]
      : [
          style,
          {
            transform: [{ translateY: position }]
          }
        ];

    return (
      <Animated.View onLayout={this.onLayout} style={viewStyles}>
        {children}
      </Animated.View>
    );
  }
}

SlideUp.defaultProps = {
  // Note: Moving this to the style sheet below results in it being undefined
  // when the default styles are calculated
  // style: StyleSheet.create({
  //     flex: 1
  // }),
  visible: false
};

SlideUp.propTypes = {
  style: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  visible: PropTypes.bool
};

const styles = StyleSheet.create({
  startingPositionStyle: {
    top: '100%'
  }
});
export default SlideUp;
