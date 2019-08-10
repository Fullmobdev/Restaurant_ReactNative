import React, { Component, PropTypes } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../styles/colors.styles';
import { Typography } from '../../styles/typography.styles';

class Tags extends Component {
  render() {
    const { name } = this.props.tag;
    const { onTagPress, checked } = this.props;
    const tagStyle = [styles.container];
    let textStyle = {};
    if (checked) {
      tagStyle.push(styles.checkedTag);
      textStyle = { color: 'white' };
    }
    return (
      <View>
        {onTagPress ? (
          <TouchableOpacity onPress={() => onTagPress(name)} style={tagStyle}>
            <Text style={[styles.tagText, textStyle]}>{name}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.container}>
            <Text style={styles.tagText}>{name}</Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.ViewsGray1Opacity(0.1),
    marginRight: 5,
    justifyContent: 'center',
    marginTop: 5
  },
  tagText: {
    ...Typography.bodySmall,
    fontWeight: 'bold',
    opacity: 0.8
  }
});

export default Tags;
