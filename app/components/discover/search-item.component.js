import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';

import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../styles/colors.styles';
import { Typography } from '../../styles/typography.styles';
import ViewsIcon from '../../fonts/icon-font';
import { fetchBusinessPhoto } from '../../actions/search-business/search-business.action';
import {
  fetchBusinessRecommendationsByPlaceId,
  selectBusiness
} from '../../actions/business.action';

import * as search from '../../services/search/search.library';
import * as SearchService from '../../services/search/search.service';
import { Moments } from '../../services/moments/moments.constants';
import { DISPLAY_MOMENT_RECOMMEND_THRESHOLD } from './search-item.constants';

const MAX_WIDTH = Dimensions.get('window').width;
const MAX_HEIGHT = Dimensions.get('window').height;

class BusinessItem extends Component {
  componentDidMount() {
    const {
      id,
      location,
      onLoadPhoto,
      photoReference,
      onLoadRecommendation,
      photoUri,
      businessId
    } = this.props;

    if (!photoUri && photoReference) {
      onLoadPhoto(id, photoReference);
    }
    onLoadRecommendation(id);
  }

  navigateToNextScene = scene => {
    Actions[scene]();
  };

  onPressItem = () => {
    const { businessId, businessCategory, onPressItem } = this.props;

    onPressItem({
      businessId,
      businessCategory
    });
  }

  renderThumbnail = photoUri => {
    return <Image style={styles.image} source={{ uri: photoUri }} resizeMode="cover" />;
  };

  renderDefaultThumbnail = () => {
    return (
      <View style={styles.defaultThumbnailContainer}>
        <Icon name="ios-image" color={Colors.ViewsGray1} size={70} />
      </View>
    );
  };

  renderRecommendedMoments = () => {
    const { recommendations } = this.props;

    if (!recommendations) { return []; }

    const recommendedMomentElements = [];

    Object.keys(Moments).forEach(momentKey => {
      const momentRecommendation = recommendations[momentKey];
      if (momentRecommendation && DISPLAY_MOMENT_RECOMMEND_THRESHOLD <= momentRecommendation.percentRecommend) {
        recommendedMomentElements.push(this.renderRecommendedMoment(Moments[momentKey]));
      }
    });

    return recommendedMomentElements;
  }
  renderRecommendedMoment = (momentName) => {
    return (
      <View style={styles.recommendedMomentContainer}>
        <Text style={styles.recommendedMomentText}>{ momentName.toUpperCase() }</Text>
      </View>
    );
  }

  render() {
    const {
      address,
      name,
      neighborhood,
      distance,
      onPressItem,
      percentRecommend,
      photoUri,
      style,
    } = this.props;
    
    let containerStyle = {};
    if (style) {
      containerStyle = style;
    }
    const recommendedMoments = this.renderRecommendedMoments();

    return (
      <View style={[styles.container, containerStyle]}>
        {photoUri != null && 
          <TouchableOpacity onPress={onPressItem}>
            {photoUri ? this.renderThumbnail(photoUri) : this.renderDefaultThumbnail()}
          </TouchableOpacity>
        }

        <TouchableOpacity style={{ flex: 1 }} onPress={this.onPressItem}>
          <View style={styles.infoContainer}>

            <View style={styles.infoRow}>
              <Text style={styles.businessName}>{name}</Text>
              { distance != null && 
                <View style={styles.distanceContainer}>
                  <ViewsIcon name="location_pin" style={styles.locationIcon} />
                  <Text style={styles.distanceText}>{`${distance} mi`}</Text>
                </View>
              }
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.neighborhoodText}>{address}</Text>
            </View>

            { percentRecommend != null &&
              <View style={[styles.infoRowSingleItem, styles.recommendContainer]}>
                <View style={styles.recommendIconContainer}>
                  <ViewsIcon name='recommend' style={styles.recommendIcon} />
                  <Text style={styles.recommendPercent}>{parseInt(percentRecommend * 100, 10)}%</Text>
                </View>
                {recommendedMoments.length > 0 && <Text style={styles.recommendedForText}>Recommended for</Text>}
              </View>}

             { percentRecommend !== undefined &&
                <View style={styles.infoRowSingleItem}>
                  { recommendedMoments }
                </View> }
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 20,
    backgroundColor: Colors.ViewsWhite,
    minHeight: 90

  },
  distanceContainer: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  distanceText: {
    ...Typography.bodySmall,
    color: Colors.ViewsBlack
  },
  image: {
    width: 58,
    height: 56
  },
  infoContainer: {
    flex: 1,
    marginLeft: 20,
    backgroundColor: Colors.ViewsWhite,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9e9e9',
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  infoRowSingleItem: {
    flexDirection: 'row'
  },
  locationIcon: {
    color: Colors.ViewsRed,
    fontSize: 12,
    marginRight: 5
  },
  businessName: {
    ...Typography.headline,
    color: Colors.ViewsBlack
  },
  neighborhoodText: {
    ...Typography.bodySmall,
    color: Colors.ViewsBlack,
  },
  recommendContainer: {
    marginVertical: 5
  },
  recommendIcon: {
    color: Colors.ViewsRed,
    marginRight: 5
  },
  recommendIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
    marginBottom: 5
  },
  recommendedForText: {
    ...Typography.bodyXSmall
  },
  recommendedMomentContainer: {
    backgroundColor: Colors.ViewsRed,
    borderRadius: 5,
    padding: 5,
    marginRight: 5
  },
  recommendedMomentText: {
    ...Typography.bodySmall,
    fontSize: 8,
    fontWeight: '800',
    color: Colors.ViewsWhite
  },
  recommendPercent: {
    ...Typography.bodyXSmall
  },
  iconStyle: {
    color: Colors.ViewsRed,
    marginRight: 5
  }
});

const mapDispatchToProps = dispatch => {
  return {
    onLoadPhoto: (id, photoReference) => {
      dispatch(fetchBusinessPhoto(id, photoReference));
    },
    onLoadRecommendation: placeId => {
      dispatch(fetchBusinessRecommendationsByPlaceId(placeId));
    },
    onSelectBusiness: business => {
      dispatch(selectBusiness(business));
    }
  };
};

export default connect(
  null,
  mapDispatchToProps
)(BusinessItem);
