import React, { Component } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import ViewsIcon from '../../fonts/icon-font';
import Colors from '../../styles/colors.styles';

class TimelineHeader extends Component {
  render() {
    return (
      <SafeAreaView style={styles.timelineHeader}>
        <ViewsIcon name={'views_logo_word'} style={{ fontSize: 24, color: Colors.ViewsRed }} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  timelineHeader: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e2e2'
  },

  headerIcon: {
    color: Colors.ViewsRed,
    fontSize: 28
  }
});

export default TimelineHeader;
