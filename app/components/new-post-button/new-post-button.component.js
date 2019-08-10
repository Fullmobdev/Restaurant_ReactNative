import Icon from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

import Colors from '../../styles/colors.styles';
import SlideInOut from '../slide-in-out/slide-in-out.component';

class NewPostButton extends Component {
  render() {
    return (
      <SlideInOut styles={styles.buttonContainer} visible={this.props.visible}>
        <TouchableOpacity
          style={styles.touchableHighlight}
          onPress={this.props.onPress}
          // underlayColor={Colors.ViewsBlue2}
        >
          <Text style={styles.newPost}>New Post</Text>
        </TouchableOpacity>
      </SlideInOut>
    );
  }
}

NewPostButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired
};

NewPostButton.defaultProps = {
  onPress: () => {},
  visible: false
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    top: 87,
    alignSelf: 'center',
    width: 89,
    height: 31,
    borderRadius: 16.5,
    backgroundColor: Colors.viewsRed2,
    shadowColor: 'rgba(88, 88, 88, 0.5)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 3,
    shadowOpacity: 1
  },
  touchableHighlight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  newPost: {
    color: Colors.ViewsWhite
  }
});

export default NewPostButton;
