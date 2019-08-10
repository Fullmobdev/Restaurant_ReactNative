import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Footer = ({
  primaryLabel,
  primaryLink,
  onPrimaryLinkPress,
  secondaryLink,
  onSecondaryLinkPress,
  containerStyle
}) => {
  return (
    <View style={containerStyle}>
        <Text>
          <Text style={styles.label}>{primaryLabel} </Text>
          <Text style={styles.link} onPress={onPrimaryLinkPress}>{primaryLink}</Text>
        </Text>
        {
          secondaryLink &&
          <Text style={[styles.link, styles.linkBottom]} onPress={onSecondaryLinkPress}>{secondaryLink}</Text>
        }
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Avenir',
    fontSize: 15,
    color: '#444',
    letterSpacing: 0.7,
    fontWeight: 'normal',
    paddingTop: 10
  },
  link: {
    fontFamily: 'Avenir',
    fontSize: 15,
    letterSpacing: 0.7,
    paddingBottom: 10,
    color: Colors.viewsRed2,
    fontWeight: '800'
  },
  linkBottom: {
    paddingTop: 5,
    color: Colors.ViewsGray1,
    fontSize: 12
  }
});
export default Footer;
