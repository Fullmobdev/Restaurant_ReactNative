import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import StarRating from 'react-native-star-rating';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { fetchBusinessDetail, fetchBusinessRecommendationsByPlaceId, selectBusiness } from '../../actions/business.action';
import Colors from '../../styles/colors.styles';
import LoadingPlaceholderStyles from '../../styles/loading-placeholder.styles';
import { isOpenNow } from '../../utils/open-now.utils';
import imgIcons from '../img-icons/img-icons';
import LoadingPlaceholder from '../loading-placeholder/loading-placeholder.component';
import { distFromLocation } from '../../services/location/location.service';

const MAX_WIDTH = Dimensions.get('window').width;
class BusinessItem extends Component {
  componentDidMount() {
    const { item, loading } = this.props;
    if (loading) { return; }

    if (!item.createdDate) {
      // Note: This is a proxy to determine if we have 
      // the business details or need to fetch them
      this.props.onLoadBusiness(item.businessId);
    }
  }

  selectBusiness = business => {
    this.props.onSelectBusiness(business);
    this.navigateToNextScene(this.props.businessScene);
  };

  navigateToNextScene = scene => {
    Actions[scene]();
  };

  getDistanceLabel = (businessLocation, userLocation) => {
    if (!businessLocation || !userLocation) { return null; }

    const distance = distFromLocation(businessLocation, userLocation);
    return `${distance} mi`;
  }

  renderThumbnail = photoUri => {
    return (
      <Image
        style={styles.image}
        source={{
          uri: photoUri
        }}
        resizeMode="cover"
      />
    );
  };

  renderDefaultThumbnail = () => {
    return (
      <View style={[styles.image, { alignItems: 'center', justifyContent: 'center' }]}>
        <Icon name="ios-image" color={Colors.ViewsGray1} size={100} />
      </View> 
    );
  };

  render() {
    let { distanceLabel } = this.props;

    const { 
      userLocation,
      item, 
      loading, 
    } = this.props;

    const { 
      businessName, 
      location,
      neighborhood,
      openingPeriods,
      photoUri, 
      googleRating, 
    } = item || {};

    const openNow = isOpenNow(openingPeriods);
    distanceLabel = distanceLabel || this.getDistanceLabel(location, userLocation);

    return (
      <View style={styles.container}>
        <LoadingPlaceholder style={styles.image} loading={loading}>
          <TouchableOpacity onPress={() => this.selectBusiness(item)}>
            {photoUri ? this.renderThumbnail(photoUri) : this.renderDefaultThumbnail()}
          </TouchableOpacity>
        </LoadingPlaceholder>
        <View style={styles.infoContainer}>
          <View style={styles.ratingPriceContainer}>
            <LoadingPlaceholder style={LoadingPlaceholderStyles.smallText} loading={loading}>
              <View style={styles.ratingLabelContainer}>
                <View>
                  <Image style={styles.googleImage} source={imgIcons.google} />
                </View>
                <StarRating
                  disabled={false}
                  maxStars={5}
                  rating={googleRating}
                  halfStar="star-half-o"
                  fullStarColor={Colors.viewsRed2}
                  halfStarColor={Colors.viewsRed2}
                  emptyStar="star"
                  emptyStarColor="#e7e7e7"
                  starSize={12}
                  starStyle={{ marginRight: 5 }}
                />
              </View>
            </LoadingPlaceholder>
            <LoadingPlaceholder style={LoadingPlaceholderStyles.smallText} loading={loading}>
              <View style={styles.openInfo}>
                {openNow ? (
                  <Text style={[styles.lightText, styles.openNow]}>Open now</Text>
                ) : (
                  <Text style={[styles.lightText, styles.closedNow]}>Closed</Text>
                )}
              </View>
            </LoadingPlaceholder>
          </View>
          <LoadingPlaceholder style={[LoadingPlaceholderStyles.smallText, { marginTop: 5 }]} loading={loading}>
            <Text style={styles.businessName}>{businessName}</Text>
          </LoadingPlaceholder>

          <View style={styles.locationContainer}>
            <LoadingPlaceholder 
              style={LoadingPlaceholderStyles.smallText} 
              loading={loading}
            >
              <View style={styles.row}>
                <Icon style={[styles.iconStyle, { color: '#aaaaaa' }]} name="ios-pin" size={12} />
                <Text style={styles.lightText}>{neighborhood}</Text>
              </View>
            </LoadingPlaceholder>
            
            <LoadingPlaceholder
              style={LoadingPlaceholderStyles.smallText}
              loading={loading}
            >
              <View style={styles.row}>
                <Image style={styles.iconImage} source={imgIcons.mapMarker} />
                <Text style={styles.lightText}>{distanceLabel}</Text>
              </View>
            </LoadingPlaceholder>
          </View>

        </View>
      </View>
    );
  }
}

BusinessItem.propTypes = {
  loading: PropTypes.bool,
  userLocation: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 280,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    // backgroundColor: '#6f94ff',
    overflow: 'hidden',
    marginRight: 8
  },
  image: {
    width: '100%',
    height: 158,
    alignSelf: 'stretch'
  },
  infoContainer: {
    width: '100%',
    paddingBottom: 20,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    // backgroundColor: 'red',
    shadowColor: '#e5eced',
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowRadius: 4,
    shadowOpacity: 1,
    paddingTop: 12,
    paddingHorizontal: 12
  },
  ratingPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  ratingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  businessName: {
    marginTop: 3,
    fontSize: 15,
    color: Colors.viewsTitleColor
  },
  locationContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 3,
    justifyContent: 'space-between'
  },
  iconStyle: {
    color: Colors.ViewsRed,
    marginRight: 5
  },
  lightText: {
    color: '#aaaaaa',
    fontSize: 13
  },
  openNow: {
    color: Colors.ViewsGreen
  },
  closedNow: {
    color: Colors.ViewsRed
  },
  tagsContainer: {
    marginTop: 10
  },
  iconImage: {
    width: 11,
    height: 14,
    marginRight: 5
  },
  googleImage: {
    width: 10,
    height: 12,
    marginLeft: 2,
    marginRight: 7
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

const mapStateToProps = (state, props) => {
  const { businesses } = state;
  const item = props.item || {};
  const { businessId } = item;

  const business = (businesses && businesses[businessId]) || {};
  
  if (item.createdDate) { return props; }

  return {
    ...props,
    item: {
      ...item,
      ...business
    }
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadRecommendation: placeId => {
      dispatch(fetchBusinessRecommendationsByPlaceId(placeId));
    },
    onLoadBusiness: businessId => {
      dispatch(fetchBusinessDetail(businessId, 'Restaurant'));
    },
    onSelectBusiness: business => {
      dispatch(selectBusiness(business));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BusinessItem);
