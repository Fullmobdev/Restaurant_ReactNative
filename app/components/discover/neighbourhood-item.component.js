import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

const NeighbourhoodItem = props => {
  return (
    <TouchableOpacity onPress={props.onPress} style={styles.container}>
      <Text style={styles.text}>{props.item.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingLeft: 16,
    backgroundColor: '#f9fafc',
    width: '100%',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e9e9e9',
    justifyContent: 'center'
  },
  text: {
    fontSize: 17,
    letterSpacing: 0.64,
    color: '#4c4c4c'
  }
});

export default NeighbourhoodItem;
