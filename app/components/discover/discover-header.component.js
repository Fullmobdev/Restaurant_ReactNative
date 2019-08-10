import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

const DiscoverHeader = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={{
          uri:
            'https://img.bildderfrau.de/img/kochen-backen/origs209542881/1767398421-w1024-h960-q85-dc1/Ananas-Burger.jpg'
        }}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: 250,
    width: '100%'
  },
  image: {
    flex: 1,
    alignSelf: 'stretch'
  }
});

export default DiscoverHeader;
