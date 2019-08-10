import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text, TouchableWithoutFeedback, View, StyleSheet } from 'react-native';
import buttonsStyles from '../../styles/icons.styles.js';
import { viewsCountIcon, viewsCountIconOutline } from '../icons/icons';
import Colors from '../../styles/colors.styles';
import { TextShadows } from '../../styles/typography.styles';
import { formatReviewStats } from '../helpers/review-stats-helpers';

const ViewsButton = ({
  containerStyle,
  iconColor,
  iconStyle,
  textStyle,
  includeLabel,
  numberOfViews,
  onTimeline
}) => {
  return (
    <View>
      {onTimeline && (
        <View style={[styles.container, TextShadows.cameraText, containerStyle]}>
          <TouchableWithoutFeedback style={buttonsStyles.iconButton}>
            <View style={[styles.container, TextShadows.cameraText, containerStyle]}>
              <Icon name={viewsCountIcon} color={iconColor} style={[styles.icon, iconStyle]} />
            </View>
          </TouchableWithoutFeedback>
          <View style={[styles.number, TextShadows.cameraText, containerStyle]}>
            {renderViewsAmount(numberOfViews, includeLabel, textStyle, onTimeline)}
          </View>
        </View>
      )}

      {!onTimeline && (
        <View style={[styles.container, containerStyle]}>
          <View style={[styles.number, containerStyle]}>
            {renderViewsAmount(numberOfViews, includeLabel, textStyle)}
          </View>
        </View>
      )}
    </View>
  );
};

const renderViewsAmount = (numberOfViews, includeLabel, textStyle, onTimeline) => {
  const numViews = numberOfViews || 0;
  return (
    <View>
      {onTimeline && (
        <Text style={[styles.label, textStyle]}>
          {`${formatReviewStats(numViews)} ${includeLabel ? 'Views' : ''}`}
        </Text>
      )}
      {!onTimeline && (
        <View style={styles.viewsContainer}>
          <Text style={[styles.label, textStyle]}>{`${formatReviewStats(numViews)}`}</Text>
          <Text style={[styles.label, textStyle]}>Views</Text>
        </View>
      )}
    </View>
  );
};

ViewsButton.propTypes = {
  numberOfViews: PropTypes.number,
  includeLabel: PropTypes.bool,
  containerStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  iconStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  iconColor: PropTypes.string,
  textStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object])
};

ViewsButton.defaultProps = {
  numberOfViews: 0,
  containerStyle: {},
  iconColor: Colors.ViewsWhite,
  iconStyle: {},
  includeLabel: false,
  textStyle: {}
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  viewsContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    fontSize: 30,
    marginBottom: 5
  },
  label: {
    fontFamily: 'Avenir',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.ViewsWhite
  },
  number: {
    marginLeft: 7
  }
});
export default ViewsButton;
