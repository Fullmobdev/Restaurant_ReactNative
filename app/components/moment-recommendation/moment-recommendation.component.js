import React from 'react';
import { View, Text, ProgressViewIOS, Image } from 'react-native';
import Colors from '../../styles/colors.styles';
import Recommended from '../../images/recommended.png';
import { Typography } from '../../styles/typography.styles';
import ProgressBar from '../progress-bar/progress-bar.component';

const MomentRecommendation = props => {
  const { moment, recommendPercent } = props;
  return (
    <View style={styles.percentRecommendContainer}>
      <View style={styles.momentContainer}>
        <Image style={styles.recommendedIcon} source={Recommended} />
        <Text style={styles.momentLabel}>{moment}</Text>
      </View>
      <ProgressBar percent={recommendPercent} />
    </View>
  );
};

const styles = {
  percentRecommendContainer: {
    paddingBottom: 10
  },
  momentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 3
  },
  momentLabel: {
    // color: '#aaaaaa',
    ...Typography.bodySmall,
    marginLeft: 6
  },
  progressBarStyle: {
    transform: [{ scaleY: 2 }],
    height: 12,
    borderRadius: 6
  },
  recommendPercent: {
    color: '#aaaaaa'
  },
  recommendedIcon: {
    height: 16,
    width: 16
  }
};

export default MomentRecommendation;
