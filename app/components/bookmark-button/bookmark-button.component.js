import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Colors from '../../styles/colors.styles';
import { bookmarkIcon, bookmarkIconOutline } from '../icons/icons';

const BookmarkButton = ({ containerStyle, iconStyle, selected, onPress }) => {
  const icon = selected ? bookmarkIcon : bookmarkIconOutline;
  const color = selected ? Colors.ViewsRed : Colors.ViewsBlack;
  return (
    <View>
      <TouchableOpacity onPress={onPress}>
        <View style={[styles.container, containerStyle]}>
          <Icon name={icon} style={[styles.icon, iconStyle]} color={color} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

BookmarkButton.propTypes = {
  selected: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  containerStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  iconStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  iconColor: PropTypes.string
};

BookmarkButton.defaultProps = {
  containerStyle: {},
  iconColor: Colors.ViewsWhite,
  iconStyle: {},
  selected: false
};

const styles = StyleSheet.create({
  container: {
  },
  icon: {
    fontSize: 36
  }
});

export default BookmarkButton;
