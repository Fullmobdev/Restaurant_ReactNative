import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Constants
import Colors from '../../styles/colors.styles';

const FollowButton = ({ loading, onFollow }) => {
  const label = loading ? 'loading..' : 'Follow'; 
  return (
    <TouchableOpacity 
      disabled={loading}
      onPress={() => onFollow()}
    >
      <View style={styles.buttonContainer}>
        <Text style={styles.text}>{ label }</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.viewsRed2,
    borderRadius: 16,
    flexDirection: 'row',
    width: 109,
    height: 32
  },
  text: {
    color: Colors.ViewsWhite,
    fontWeight: 'bold'
  }
});

export default FollowButton;
