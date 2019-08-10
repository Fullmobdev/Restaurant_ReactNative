import React from 'react';
import { Text, View } from 'react-native';

const HeaderText = ({ children }) => {
  const { headerContainerStyle, textStyle } = styles;

  return (
    <View style={headerContainerStyle}>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
};

const styles = {
  textStyle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Avenir',
    color: '#424242'
  },
  headerContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f2efed',
    backgroundColor: '#fff',
    height: 70,
    paddingTop: 10,
  },
}

export default HeaderText;
