import React from 'react';
import { View, ActivityIndicator } from 'react-native';

const Spinner = ({ size, marginTop, height }) => {
  // const { spinnerStyle } = styles;
  return (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: 100,
      height: height,
      marginTop: marginTop,
    }}
  >
    <ActivityIndicator size={size || 'large'} />
  </View>
  );
};

// const styles = {
//   spinnerStyle: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 100,
//     height: 20,
//     // paddingTop: 5,
//   }
// };

export default Spinner;
