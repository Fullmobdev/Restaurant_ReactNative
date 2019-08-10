import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import ViewsIcon from '../../fonts/icon-font';

const LikeButton = (props) => {
  const {
    onPress, 
    selected
  } = props;
  const iconName = selected ? 'heart' : 'heart_outline';

  return (
    <TouchableOpacity onPress={onPress}>
      <ViewsIcon 
        style={styles.icon} 
        name={iconName}       
      />
    </TouchableOpacity>
  );
};

LikeButton.PropTypes = {
  onPress: PropTypes.func,
  selected: PropTypes.bool
};

LikeButton.defaultProps = {
  onPress: () => {},
  selected: false
};

const styles = StyleSheet.create({
  icon: { 
    color: Colors.ViewsGray2, 
    fontSize: 24, 
    marginRight: 20 
  }
});

export default LikeButton;
