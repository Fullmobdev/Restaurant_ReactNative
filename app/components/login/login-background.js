import React, { Component } from 'react';
import { Text, View, Image } from 'react-native';
import imgIcons from '../img-icons/img-icons';

class LoginBackground extends Component {
  render() {
    const { transparent } = this.props;
    return (
      <View style={{ height: '100%', width: '100%' }}>
        {transparent ? (
          <Image
            source={imgIcons.maskTransparent}
            style={{
              flex: 1,
              width: undefined,
              height: undefined
            }}
            resizeMode="stretch"
          />
        ) : (
          <Image
            source={imgIcons.mask}
            style={{
              flex: 1,
              width: undefined,
              height: undefined
            }}
            resizeMode="stretch"
          />
        )}
        {this.props.children}
      </View>
    );
  }
}

export default LoginBackground;
