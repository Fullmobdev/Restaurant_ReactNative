import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import ViewsButton from './views-button.component';

import Colors from '../../styles/colors.styles';

const ViewsButtonOnWhite = ({ numberOfViews }) => {
  return (
    <ViewsButton
      numberOfViews={numberOfViews}
      includeLabel
      containerStyle={styles.container}
      iconColor={Colors.ViewsBlack1}
      iconStyle={styles.icon}
      textStyle={styles.text}
      onTimeline
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    shadowColor: 'transparent'
  },
  icon: {
    marginRight: 5,
    marginBottom: 0,
    fontSize: 21
  },
  text: {
    color: Colors.ViewsBlack,
    fontWeight: '400',
    fontSize: 10
  }
});

export default ViewsButtonOnWhite;
