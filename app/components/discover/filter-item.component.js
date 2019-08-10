import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../styles/colors.styles';

class FilterItem extends Component {
  render() {
    const { text, checked, onPress } = this.props;
    let textStyles = [styles.filterText];
    if (checked) {
      textStyles = [styles.filterText, styles.checkedText];
    }
    return (
      <TouchableOpacity onPress={onPress} style={styles.container}>
        <Text style={textStyles}>{text}</Text>
        {checked ? (
          <Icon name="ios-checkbox-outline" style={styles.checkmark} color={Colors.viewsRed2} />
        ) : (
          <Icon name="ios-square-outline" style={styles.checkmark} color={Colors.viewsRed2} />
        )}
      </TouchableOpacity>
    );
  }
}

const styles = {
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9e9e9'
  },
  filterText: {
    fontSize: 15,
    color: '#4c4c4c'
  },
  box: {
    width: 21,
    height: 21,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ff3366',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkmark: {
    fontSize: 24,
    fontWeight: 'bold'
    // height: 24
  },
  checkedText: {
    color: Colors.viewsRed2
  }
};

export default FilterItem;
