import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

const Press = ({ onPress, children, buttonStyle, buttonTextStyle, disabled, enabled }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[buttonStyle, enabled && styles.enableButtonStyle]}
      disabled={!enabled}
    >
      <Text style={buttonTextStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  enableButtonStyle: {
    backgroundColor: '#ff3366'
  }
});

export default Press;
