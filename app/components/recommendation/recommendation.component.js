import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Recommended from '../../images/recommended.png';
import { Typography } from '../../styles/typography.styles';

const Recommendation = ({ percentRecommend }) => {
  const { recommendContainer } = styles;

  return (
    <View>
      <View style={styles.recommendLabelContainer}>
        <Image style={styles.recommendedIcon} source={Recommended} />
        {isValidRecommendPercent(percentRecommend) && renderRecommendPercent(percentRecommend)}
        <Text style={styles.recommendLabel}>
          {isValidRecommendPercent(percentRecommend) ? 'recommendation' : 'No Recommends'}
        </Text>
      </View>      
    </View>
  );
};

function renderRecommendPercent(percent) {
  return <Text style={styles.recommendPercent}>{Math.round(percent * 100)}% </Text>;
}

function isValidRecommendPercent(percent) {
  return percent || percent === 0;
}
Recommendation.propTypes = {
  percentRecommend: PropTypes.number,
  numOfRecommendations: PropTypes.number
};

const styles = StyleSheet.create({
  recommendLabel: {
    ...Typography.body,
    // color: '#BDBDBD',
    // fontSize: 12,
    // fontWeight: '600'
  },
  recommendLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  recommendPercent: {
    ...Typography.body,
    // color: '#BDBDBD',
    // fontSize: 14,
    // fontWeight: '500',
    marginLeft: 6
  },
  recommendTotalContainer: {
    alignItems: 'flex-end',
    flex: 1
  },
  recommendedIcon: {
    height: 16,
    width: 16
  }
});

export default Recommendation;
