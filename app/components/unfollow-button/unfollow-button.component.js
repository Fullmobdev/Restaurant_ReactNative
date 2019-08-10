import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Constants
import Colors from '../../styles/colors.styles';

const UnfollowButton = ({ loading, onUnfollow }) => {
  const label = loading ? 'loading..' : 'Unfollow';
  return (
    <TouchableOpacity 
      disabled={loading}
      onPress={() => onUnfollow()}
    >
      <View style={styles.buttonContainer}>
        <Text style={styles.text}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.ViewsWhite,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.viewsRed2,
    height: 32,
    borderRadius: 16,
    flexDirection: 'row',
    width: 109
  },
  text: {
    color: Colors.viewsRed2
  }
});

export default UnfollowButton;
