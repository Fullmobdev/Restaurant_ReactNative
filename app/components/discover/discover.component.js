import moment from 'moment';
import React, { Component } from 'react';
import { Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { fetchBusinessDetail } from '../../actions/business.action';
import { fetchDiscoverData, watchTopReviewers } from '../../actions/discover.action';
import { fetchUserFollowing } from '../../actions/follow-status/follow-status.action';
import { searchBusiness } from '../../actions/search-business/search-business.action';
import { loadUserAggregates, loadUserLocationAddress } from '../../actions/users/users.action';
import * as locationService from '../../services/location/location.service';
import Colors from '../../styles/colors.styles';
import { arrowForward, bookmarkIconOutline } from '../icons/icons';
import imgIcons from '../img-icons/img-icons';
import TopReviewers from '../top-reviewers/top-reviewers.component';
import BusinessItem from './business-item.component';
import DiscoverHeader from './discover-header.component';
import { Typography } from '../../styles/typography.styles';




const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;

class Discover extends Component {
  constructor(props) {
    super(props);

    this.currentCoords = null;
  }
  componentWillMount() {
    const {
      onLoadUserAggregates,
      onLoadUserFollowing,
      onLoadUserLocationAddress,
      userId
    } = this.props;

    locationService.getCurrentLocation().then(loc => {
      this.currentCoords = loc;
      onLoadUserLocationAddress(this.currentCoords);
    });
    this.props.fetchDiscoverData();
    this.props.setupTopReviewersListener();
    onLoadUserFollowing(userId);
    onLoadUserAggregates(userId);
  }
  navigateToScene = (scene, heading, data) => {
    Actions[scene]({ heading, data });
  };

  componentDidMount() {
    const { businesses } = this.props;
    const bookmarks = this.props.bookmarks || [];
    Object.keys(bookmarks).forEach(item => {
      const business = businesses[item];
      if (business == null) {
        this.props.fetchBusinessDetail(item, 'Restaurant');
      }
    });
  }

  topReviewersComparator = (reviewerA, reviewerB) => {
    return reviewerA.rank <= reviewerB.rank ? -1 : 1;
  }

  renderRestaurants = (restaurants) => {
    if (!restaurants) {
      return this.renderRestaurantPlaceholders();
    }

    return restaurants.map(restaurant => this.renderTopDiscoveries(restaurant));
  }

  renderRestaurantPlaceholders = () => {
    const restaurantElems = [];
      for (let i = 0; i < 5; i++) {
        restaurantElems.push(
          <View key={i} style={styles.businessItemContainer}>
            <BusinessItem loading />
          </View>
        );
      }
      return restaurantElems;
  }

  renderTopDiscoveries = item => {
    let distanceLabel = '';

    if (this.currentCoords) {
      const { location } = item;
      distanceInMiles = locationService.distFromLocation(location, this.currentCoords) || '';
      distanceLabel = `${distanceInMiles} mi`;
    }
    // this.props.onSearchBusiness(item.businessName);

    return (
      <View key={item.businessId} style={styles.businessItemContainer}>
        <BusinessItem
          item={item}
          distanceLabel={distanceLabel}
          businessScene={this.props.businessScene}
        />
      </View>
    );
  };

  renderScoreToBecomeTopReviewer = (minScoreToTopReviewer) => {
    if (minScoreToTopReviewer && minScoreToTopReviewer > 0) {
      return (
        <Text style={styles.potentialTopReviewerScore}>
          { `You are ${minScoreToTopReviewer} ${minScoreToTopReviewer === 1 ? 'review' : 'reviews'} from being a top reviewer!`}
        </Text>
      );
    }
    return null;
  }

  render() {
    const { aggregates, discover, bookmarks, businesses, isTopReviewer } = this.props;
    const { TopRecommended, TopReviewers: discoverTopReviewers, NewOnViews } = discover || {};

    let { minimumScore: minScoreToTopReviewer } = discoverTopReviewers || {};
    const { topReviewerScore } = aggregates || {};

    if (minScoreToTopReviewer && topReviewerScore && 
        moment(topReviewerScore.lastUpdated).week() === moment().week()) {

      minScoreToTopReviewer -= topReviewerScore.score;
    }

    let topRecommended;
    let newOnViews;
    if (TopRecommended) {
      topRecommended = Object.values(TopRecommended.restaurants);
    }
    if (NewOnViews) {
      newOnViews = Object.values(NewOnViews.restaurants);
    }
    const { reviewers } = discoverTopReviewers || {};
    const topReviewers = reviewers ? Object.values(reviewers) : [];
    topReviewers.sort(this.topReviewersComparator);

    const myBookmarks = Object.keys((bookmarks || {}))
      .map(businessId => {
        return { businessId };
      });

    return (
      <View style={{ flex: 1 }}>
        <DiscoverHeader />
        <ScrollView
          style={styles.container}
          showsHorizontalScrollIndicator={false}
          overScrollMode='never'
        >
          <StatusBar barStyle="light-content" translucent />
          <View style={{ height: 250, backgroundColor: 'transparent' }} />
          <View style={{ backgroundColor: '#f9fafc', paddingBottom: 1 }}>
            <TouchableWithoutFeedback
              onPress={() => this.navigateToScene(this.props.nextScene)}
            >
              <View style={styles.searchBar}>
                <Image source={imgIcons.searchRed} />
                <Text style={styles.searchText}>Looking for something tasty?</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.infoContainer}>
            {/* RECOMMENDED CONTAINER */}

            <View>
              <View style={styles.recommendedHeader}>
                <Text style={styles.heading}>Recommended near you</Text>
                <TouchableOpacity
                  onPress={() =>
                    this.navigateToScene(
                      this.props.recommendedNearYouScene,
                      'Recommended near you',
                      topRecommended
                    )
                  }
                >
                  <Text style={styles.seeAll}>see all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.recommendedItems}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                { this.renderRestaurants(topRecommended) }
              </ScrollView>
            </View>

            {/* Top Reviewers */}
            { topReviewers.length > 0 &&
              <View style={{ marginBottom: 20 }}>
                <Text style={[styles.heading, styles.topReviewersHeading]}>Top Reviewers</Text>
                { !isTopReviewer && this.renderScoreToBecomeTopReviewer(minScoreToTopReviewer) }
                <TopReviewers
                  userScene={this.props.userScene}
                  registrationRedirectScene={this.props.registrationRedirectScene}
                  reviewers={topReviewers}
                />

                
              </View>
            }

            <TouchableOpacity
              onPress={() =>
                this.navigateToScene(
                  this.props.topRecommendedScene,
                  'Top 10 recommended this week',
                  topRecommended
                )
              }
              style={styles.topRecommendationsContainer}
            >
              <View style={{ flexDirection: 'row' }}>
                <Image style={styles.recommendedIcon} source={imgIcons.recommended} />
                <Text style={[styles.smallHeading, { marginLeft: 12 }]}>
                  Top 10 recommended this week
                </Text>
              </View>
              <Icon name={arrowForward} color={Colors.viewsRed2} size={16} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.navigateToScene(this.props.myBookmarksScene, 'My Bookmarks', myBookmarks)
              }
              style={styles.topRecommendationsContainer}
            >
              <View style={{ flexDirection: 'row' }}>
                <Icon
                  name={bookmarkIconOutline}
                  style={{ marginLeft: 2 }}
                  color={Colors.viewsRed2}
                  size={24}
                />
                <Text style={[styles.smallHeading, { marginLeft: 12 }]}>My Bookmarks</Text>
              </View>
              <Icon name={arrowForward} color={Colors.viewsRed2} size={16} />
            </TouchableOpacity>

            {/* NEW CONTAINER */}

            <View style={styles.itemsContainer}>
              <View style={styles.recommendedHeader}>
                <Text style={styles.heading}>New on Views</Text>
                <TouchableOpacity
                  onPress={() =>
                    this.navigateToScene(
                      this.props.newOnViewsScene,
                      'New on Views App',
                      newOnViews
                    )
                  }
                >
                <Text style={styles.seeAll}>see all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.recommendedItems}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                { this.renderRestaurants(newOnViews) }
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    marginBottom: 70,
    marginTop: -STATUSBAR_HEIGHT
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
    marginTop: -28,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16
  },
  businessItemContainer: {
    width: 287,
    marginRight: 8
  },
  infoContainer: {
    paddingTop: 24,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafc',
  },
  itemsContainer: {
    marginTop: 24
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  seeAll: {
    fontSize: 15,
    color: Colors.viewsRed2
  },
  heading: {
    fontSize: 17,
    color: Colors.viewsTitleColor
  },
  smallHeading: {
    fontSize: 15,
    color: Colors.viewsTitleColor
  },
  recommendedItems: {
    marginTop: 16
  },
  searchText: {
    fontSize: 15,
    letterSpacing: 0.64,
    color: '#8f8f8f',
    marginLeft: 16
  },
  topRecommendationsContainer: {
    flexDirection: 'row',
    marginTop: 32,
    justifyContent: 'space-between'
  },
  topReviewersHeading: {
    marginBottom: 10
  },
  recommendedIcon: {
    width: 16,
    height: 16
  },
  potentialTopReviewerScore: {
    marginBottom: 10,
    ...Typography.bodyXSmall
  }
});

const mapStateToProps = state => {
  const { businesses, user } = state;
  const { uid: userId, aggregates } = user;
  const { discover } = state;
  const { bookmarks } = state.user;

  let isTopReviewer = false;
  if (discover.TopReviewers) {
    const { reviewers } = discover.TopReviewers;
    isTopReviewer = !!reviewers[userId];
  }

  
  return { 
    aggregates, 
    discover, 
    bookmarks, 
    businesses, 
    userId,
    isTopReviewer
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchDiscoverData: () => dispatch(fetchDiscoverData()),
    fetchBusinessDetail: (businessId, businessCategory) =>
      dispatch(fetchBusinessDetail(businessId, businessCategory)),
    onLoadUserAggregates: (userId) => dispatch(loadUserAggregates(userId)),
    onLoadUserFollowing: (userId) => dispatch(fetchUserFollowing(userId)),
    onSearchBusiness: searchText => {
      dispatch(searchBusiness(searchText));
    },
    onLoadUserLocationAddress: (location) => {
      dispatch(loadUserLocationAddress(location));
    },
    setupTopReviewersListener: () => {
      dispatch(watchTopReviewers());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Discover);
