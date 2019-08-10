import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView
} from 'react-native';
import DismissKeyboard from 'dismissKeyboard';
import MapView, { Marker } from 'react-native-maps';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import imgIcons from '../img-icons/img-icons';

import * as locationService from '../../services/location/location.service';
import * as search from '../../services/search/search.library';

import { searchBusiness } from '../../actions/search-business/search-business.action';
import {
  selectBusiness,
  fetchBusinessRecommendationsByPlaceId
} from '../../actions/business.action';
import {
  fetchReviewsForBusiness,
  selectVisit,
  fetchReviews,
  watchFirebaseForUpdates
} from '../../actions/review.action';
import { getBusinessSearchResults } from '../../selectors/business-search-selectors';
import NeighbourhoodItem from '../discover/neighbourhood-item.component';
import CustomMarker from './custom-marker.component';

class HeatMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      searchResults: false,
      clearIcon: false,
      searchText: '',
      locationText: '',
      locationClearIcon: false,
      locationSearchResults: [],
      selectedLocation: undefined,
      locationCoords: null,
      newItemsAvailable: false
    };
  }

  componentDidMount() {
    this.loadReviews();
    setTimeout(() => {
      if (this.refs.map) {
        this.refs.map.fitToElements(true);
      }
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchResults.length > 0) {
      setTimeout(() => {
        if (this.refs.map) {
          this.refs.map.fitToElements(true);
        }
      }, 0);
    }

    const { reviews } = nextProps;

    if (this.props.reviews !== reviews) {
      if (this.receivedNewReviews(this.props.reviews, reviews)) {
        //If it makes it here that means a review was added
        this.setState({ newItemsAvailable: true });
      }
    }
  }

  loadReviews = () => {
    //Get current location
    if (this.currentCoords) {
      return;
    }
    locationService.getCurrentLocation().then(loc => {
      this.currentCoords = loc;

      //fetch reviews initially, then turn on connection for items added
      if (this.props.reviews.length === 0) {
        this.props.fetchReviews(5);
      }

      // this.props.watchFirebaseForUpdates();
    });
  };

  receivedNewReviews = (previousReviews, currentReviews) => {
    return previousReviews.length > 0 && previousReviews[0].reviewId !== currentReviews[0].reviewId;
  };

  fetchReviews = review => {
    DismissKeyboard();
    const { businessCategory, businessId } = review;
    this.props.onSelectBusiness(review);
    if (businessId) {
      this.props.fetchReviewsForBusiness(businessId, businessCategory);
    }
    if (review.id) {
      this.props.onLoadRecommendation(review.id);
    }
  };

  navigateToPreviousScene = () => {
    Actions.pop();
  };

  handleSearchBusiness = text => {
    this.searchText = text;
    this.setState({ text });
    this.props.onSearchBusiness(text, this.state.locationCoords);
    this.setState({
      searchResults: true,
      clearIcon: true
    });
    if (!text) {
      this.setState({
        clearIcon: false
      });
    }
  };

  handleSearchLocation = text => {
    this.searchText = text;
    this.setState({ locationText: text });
    // this.props.onSearchBusiness(text);
    this.setState({
      searchResults: true,
      locationClearIcon: true
    });
    if (!text) {
      this.setState({
        locationClearIcon: false
      });
    }
    this.searchLocation();
  };

  handleReviewPress = () => {
    const { onSelectVisit, reviewScene, visitIds } = this.props;

    onSelectVisit(reviewObject.index, visitIds);
    this.navigateToNextScene(reviewScene);
  };

  searchLocation = () => {
    // PASSING TYPE AS GEOCODE
    search
      .loadBusinessesFromSearchText(
        this.state.locationText,
        this.props.currentCoords,
        undefined,
        'geocode'
      )
      .then(res => {
        if (res.length > 0) {
          this.setState({ locationSearchResults: res });
        }
      });
  };

  onLocationPress = item => {
    const { location } = item;
    const { lat, lng } = location || {};

    this.setState(
      {
        selectedLocation: item,
        locationText: '',
        locationCoords: { latitude: lat, longitude: lng }
      },
      () => {
        if (this.state.text) {
          this.handleSearchBusiness(this.state.text);
        }
      }
    );
  };

  itemPressed = reviewObject => {
    const { onSelectVisit, reviewScene, visitIds } = this.props;

    onSelectVisit(reviewObject.index, visitIds);
    this.navigateToNextScene(reviewScene);
  };

  navigateToNextScene = scene => {
    Actions[scene]();
  };

  clearText = () => {
    this.setState({ text: '', searchResults: false, clearIcon: false });
  };

  changeLocation = () => {
    this.setState({
      selectedLocation: undefined,
      locationText: '',
      locationClearIcon: false,
      locationCoords: null
    });
  };

  renderBackIcon = () => {
    return (
      <View style={[styles.topButtonRow, styles.topButtonRowContainer]}>
        <TouchableOpacity onPress={this.navigateToPreviousScene}>
          <Icon name="ios-arrow-back" size={35} color={Colors.viewsRed2} />
        </TouchableOpacity>
      </View>
    );
  };

  renderSearchBars = () => {
    return (
      <View style={styles.searchBarsContainer}>
        <View style={styles.searchBar}>
          <Image source={imgIcons.searchRed} />
          <TextInput
            style={styles.input}
            placeholder="Search restaurant, cuisines..."
            onChangeText={this.handleSearchBusiness}
            value={this.state.text}
            autoCorrect={false}
          />
          {this.state.clearIcon && (
            <Icon
              size={26}
              style={[styles.icon]}
              name="ios-close"
              onPress={this.clearText}
              color="#4c4c4c"
            />
          )}
        </View>
        {!this.state.selectedLocation && (
          <View style={styles.searchBar}>
            <Image source={imgIcons.location} />
            <TextInput
              style={styles.input}
              placeholder="Type a city or neighborhood…"
              onChangeText={this.handleSearchLocation}
              value={this.state.locationText}
              autoCorrect={false}
            />
            {this.state.locationClearIcon && (
              <Icon
                size={26}
                style={[styles.icon]}
                name="ios-close"
                onPress={this.clearLocationText}
                color="#4c4c4c"
              />
            )}
          </View>
        )}
        {this.state.selectedLocation && (
          <View style={styles.locationStyle}>
            <View style={styles.row}>
              <Image source={imgIcons.location} />
              <Text style={styles.locationText}>{this.state.selectedLocation.name}</Text>
            </View>
            <View>
              <TouchableOpacity onPress={this.changeLocation}>
                <Text style={styles.changeText}>change</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  renderReviews = () => {
    const { reviewList } = this.props;
    return (
      <ScrollView style={styles.reviewsContainer} horizontal showsHorizontalScrollIndicator={false}>
        {reviewList &&
          reviewList.length > 0 &&
          reviewList.map((review, index) => {
            return (
              <TouchableOpacity
                onPress={() => this.itemPressed({ item: review, index })}
                style={styles.reviewItem}
              >
                <Image style={styles.image} source={{ uri: review.thumbnail }} resizeMode="cover" />
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    );
  };

  render() {
    const { searchResults, tagBusiness } = this.props;
    const { latitude, longitude } = this.props.currentCoords;

    return (
      <View style={styles.container}>
        <View style={styles.location}>
          <MapView
            ref="map"
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.05, //0.0922,
              longitudeDelta: 0.05 //0.0421,
            }}
            provider="google"
            style={styles.map}
            // minZoomLevel={10}
            maxZoomLevel={18}
            // showsMyLocationButton
            showsUserLocation
            showsIndoorLevelPicker={false}
            showsIndoors={false}
            showsPointsOfInterest={false}
            showsBuildings={false}
            onPress={() => DismissKeyboard()}
          >
            {this.props.reviews &&
              this.state.text.length === 0 &&
              this.props.reviews.map(review => {
                const { businessLocation } = review;
                const { lat, lng } = businessLocation || {};

                return (
                  <Marker
                    coordinate={{
                      latitude: lat,
                      longitude: lng
                    }}
                    onPress={() => this.fetchReviews(review)}
                    image={imgIcons.pinMap}
                  />
              )})}
            {this.state.text.length > 0 &&
              this.props.searchResults.length > 0 &&
              this.props.searchResults.map(result => {
                const { location } = result;
                const { lat, lng } = location || {};
                return (                
                  <CustomMarker
                    latitude={lat}
                    longitude={lng}
                    onPress={() => this.fetchReviews(result)}
                    image={imgIcons.pinMap}
                    result={result}
                    key={result.id}
                  />
              )})}
          </MapView>
        </View>
        {this.renderBackIcon()}
        {this.renderSearchBars()}
        {!!this.state.locationText &&
          this.state.locationSearchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              {this.state.locationSearchResults.map(item => {
                return (
                  <NeighbourhoodItem
                    key={item.id}
                    onPress={() => this.onLocationPress(item)}
                    item={item}
                  />
                );
              })}
            </View>
          )}
        {this.renderReviews()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  location: {
    flex: 1
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    flex: 1
  },
  topButtonRowContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%'
  },
  topButtonRow: {
    paddingLeft: 20,
    paddingTop: 40,
    paddingRight: 20,
    flexDirection: 'row'
  },
  searchBarsContainer: {
    position: 'absolute',
    top: 80,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchBar: {
    alignSelf: 'center',
    width: 343,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: 'rgba(154, 154, 154, 0.5)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 1,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8
  },
  input: {
    marginLeft: 20,
    width: '75%'
  },
  locationStyle: {
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: 343,
    height: 56,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locationText: {
    fontSize: 17,
    color: '#4c4c4c',
    marginLeft: 18
  },
  changeText: {
    fontSize: 13,
    color: Colors.viewsRed2
  },
  searchResultsContainer: {
    paddingHorizontal: 16,
    position: 'absolute',
    top: 210,
    width: '100%'
  },
  reviewsContainer: {
    height: 116,
    position: 'absolute',
    width: '100%',
    bottom: 16
  },
  reviewItem: {
    marginLeft: 8,
    width: 134,
    height: 116,
    backgroundColor: 'gray',
    borderRadius: 10,
    overflow: 'hidden'
  },
  image: {
    flex: 1,
    alignSelf: 'stretch',
    width: undefined,
    height: undefined,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const mapStateToProps = state => {
  const { businessSearch, moment, businesses, businessReviews, visits } = state;
  const { visitIds } = state.visits;
  const { businessSearchResults, businessSearchText, businessSearches } = businessSearch;
  const selectedBusiness = businesses.selectedBusiness;
  const selectedBusinessId = selectedBusiness ? selectedBusiness.businessId : {};
  const business = businesses && businesses[selectedBusinessId];
  const { viewedReviewList, visitsViewedStatus } = state.user;

  let reviewList;
  if (business) {
    reviewList = (business.visitIds || []).map(visitId => {
      const visit = visits[visitId];
      const { reviewIds } = visit;
      const businessReview = businessReviews[reviewIds[0]];
      return {
        thumbnail: businessReview.thumbnail,
        moment: businessReview.moment,
        visitId
      };
    });
  }

  const timelineReviews = visitIds.map(visitId => {
    const reviewIds = state.visits[visitId].reviewIds;
    const numReviews = reviewIds.length;
    //Get the latest review

    const visitViewedStatus = visitsViewedStatus[visitId];
    const firstReviewToWatchIndex = visitViewedStatus
      ? visitViewedStatus.firstReviewToWatchIndex
      : null;
    const showNewIndicator = firstReviewToWatchIndex < numReviews;
    const reviewIdIndex = showNewIndicator ? firstReviewToWatchIndex : numReviews - 1;
    const reviewId = reviewIds[reviewIdIndex];

    review = {
      ...state.reviews[reviewId],
      firstReviewToWatchIndex: showNewIndicator ? firstReviewToWatchIndex : 0,
      showNewIndicator
    };
    return review;
  });

  return {
    loadingRecommendations: state.businessSearch.businessSearchResults.isFetchingRecommendations,
    searchResults: getBusinessSearchResults(state),
    businessSearchText,
    businessSearchResults,
    businessSearches,
    reviewList: reviewList || null,
    visitIds: business && business.visitIds,
    reviews: timelineReviews
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSearchBusiness: (searchText, locationCoords) => {
      dispatch(searchBusiness(searchText, locationCoords));
    },
    onSelectBusiness: business => {
      dispatch(selectBusiness(business));
    },
    fetchReviewsForBusiness: (businessId, businessCategory) =>
      dispatch(fetchReviewsForBusiness(businessId, businessCategory)),
    onSelectVisit: (selectedVisitIndex, selectedVisitsIds) => {
      dispatch(selectVisit({ selectedVisitIndex, selectedVisitsIds }));
    },
    onLoadRecommendation: placeId => {
      dispatch(fetchBusinessRecommendationsByPlaceId(placeId));
    },
    watchFirebaseForUpdates: () => {
      dispatch(watchFirebaseForUpdates());
    },
    fetchReviews: limit => {
      dispatch(fetchReviews(limit));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeatMap);
