import React from 'react';
import { Text, View } from 'react-native';
import Spinner from './spinner/spinner';

const Modal = () => {
  return (
    <View style={styles.containerStyle}>
      <View style={styles.boxStyle}>
        <Text style={styles.textStyle}>Loading...</Text>
        <Spinner size='small' />
      </View>
    </View>
  );
};

const styles = {
  containerStyle: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'rgba(0,0,0,0.6)',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    zIndex: 2000,
    alignItems: 'center',
    paddingTop: 200,
  },
  boxStyle: {
    alignItems: 'center',
    width: '50%',
    height: 90,
    // backgroundColor: '#E54B4B',
    // borderRadius: 15,
    // padding: 10,
    // borderColor: '#E54B4B',
    // borderWidth: 5,
  },
  textStyle: {
    fontFamily: 'Avenir',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
}

export default Modal;
