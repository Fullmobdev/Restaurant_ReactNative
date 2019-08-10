import React from 'react';
import { View, Image } from 'react-native';
import Logo from '../images/logo_font.png';

const HeaderLogo = ({ onPress }) => {
  const { headerContainerStyle, logoImage } = styles;

  return (
    <View style={headerContainerStyle}>
      <Image style={logoImage} source={Logo} onPress={onPress} />
    </View>
  );
};

const styles = {
  headerContainerStyle: {
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 65,
    // paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2efed',
  },
  logoImage: {
    height: 30,
    width: 60,
    marginTop: 27,
    resizeMode: 'contain'
  },
};

export default HeaderLogo;
