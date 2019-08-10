import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const Categories = () => {
  return (
    <TouchableOpacity style={styles.container}>
      <Image
        style={styles.image}
        source={{
          uri:
            'https://img.bildderfrau.de/img/kochen-backen/origs209542881/1767398421-w1024-h960-q85-dc1/Ananas-Burger.jpg'
        }}
        resizeMode="cover"
      />
      <View style={styles.categoryContainer}>
        <Text style={styles.category}>Gluten Free</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 152,
    height: 200,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    // borderRadius: 6,
    backgroundColor: '#ffffff',
    marginRight: 8,
    overflow: 'hidden'
  },
  categoryContainer: {
    height: 40,
    shadowColor: '#e0e0e0',
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowRadius: 10,
    shadowOpacity: 1
  },
  category: {
    marginTop: 12,
    marginLeft: 12
  },
  image: {
    // flex: 1,
    width: 152,
    height: 155,
    alignSelf: 'stretch',
    overflow: 'hidden'
  }
});

export default Categories;
