import React from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableWithoutFeedback, View, Image, TouchableOpacity } from 'react-native';
import RecommendButton from '../recommend-button/recommend-button.component';
import imgIcons from '../img-icons/img-icons';
import Colors from '../../styles/colors.styles';

const Radio = props => {
  const { selected, text, onPress } = props;
  let filterStyle = styles.filterStyle;
  if (selected) {
    filterStyle = [styles.filterStyle, styles.selectedFilter];
  }
  return (
    <TouchableOpacity onPress={() => onPress(text)} style={styles.filter}>
      <View style={styles.circle}>{selected && <View style={styles.selectedCircle} />}</View>
      <Text style={filterStyle}>{text}</Text>
    </TouchableOpacity>
  );
};

const ReviewBusinessRecommendView = ({
  moment,
  name,
  onPost,
  onToggle,
  recommendation,
  buttonTitle,
  disabled,
  recommendationLoaded,
  selectMoment
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.thumbnailContainer}>
        <Image source={imgIcons.recommendBig} />
        <Text style={styles.title}>Would you recommend this place for... ? </Text>
      </View>
      <Radio text="Food" selected={moment === 'Food'} onPress={selectMoment} />
      <Radio
        text="Customer Service"
        selected={moment === 'Customer Service'}
        onPress={selectMoment}
      />
      <Radio text="Ambiance" selected={moment === 'Ambiance'} onPress={selectMoment} />

      {/* <View style={styles.recommentButtonContainer}>
        {recommendationLoaded ? (
          <RecommendButton selected={recommendation} onPress={() => onToggle(!recommendation)} />
        ) : (
          <View style={styles.defaultContainer} />
        )}
      </View> */}
      <TouchableOpacity
        onPress={() => {
          onPost(true); // SENDING RECOMMENDATION AS TRUE
        }}
        disabled={disabled}
      >
        <View style={styles.postButton}>
          <Text style={styles.postButtonText}>Definitely</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          onPost(false); // SENDING RECOMMENDATION AS FALSE
        }}
        disabled={disabled}
      >
        <View style={styles.nopeButton}>
          <Text style={styles.nopeButtonText}>Nope</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

ReviewBusinessRecommendView.PropTypes = {
  moment: PropTypes.string,
  name: PropTypes.string,
  onPost: PropTypes.func,
  onToggle: PropTypes.func,
  recommendation: PropTypes.bool
};

const styles = {
  container: {
    // alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 18
  },
  postButton: {
    marginTop: 35,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 10,
    width: '100%',
    backgroundColor: Colors.viewsRed2,
    height: 57,
    borderRadius: 13
  },
  nopeButton: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 10,
    width: '100%',
    height: 57
  },
  nopeButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '600'
  },
  postButtonText: {
    fontSize: 20,
    color: 'white'
  },
  rating: {
    marginBottom: 40
  },
  recommentButtonContainer: {
    marginBottom: 10
  },
  thumbnailContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  thumbnail: {
    height: 80,
    width: 80,
    marginRight: 10
  },
  textContainer: {
    fontFamily: 'Avenir',
    lineHeight: 31,
    paddingHorizontal: 10,
    textAlign: 'center'
  },
  title: {
    fontFamily: 'Avenir',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.41,
    color: '#000000',
    marginLeft: 10,
    flex: 1,
    flexWrap: 'wrap'
  },
  titleHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ViewsBlue
  },
  titleHighlightSecondary: {
    fontWeight: '800',
    color: Colors.ViewsGray4,
    fontSize: 16
  },
  defaultContainer: {
    height: 87.5,
    width: '100%',
    backgroundColor: 'white'
  },
  filter: {
    flexDirection: 'row',
    marginTop: 34
  },
  filterStyle: {
    fontSize: 17,
    marginLeft: 16
  },
  selectedFilter: {
    color: Colors.viewsRed2
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#ff3366',
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedCircle: {
    width: 12,
    height: 12,
    borderRadius: 11,
    backgroundColor: '#ff3366'
  }
};

export default ReviewBusinessRecommendView;
