import _ from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { MaterialIndicator } from 'react-native-indicators';
import { Actions } from 'react-native-router-flux';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { fetchBusinessDetail, selectBusiness } from '../actions/business.action';
import { fetchUserFollowers, fetchUserFollowing, followUser, loadFollowingStatus, unfollowUser } from '../actions/follow-status/follow-status.action';
import { fetchMostRecentUserReviews, fetchReviewExtension, fetchUserReviews, loadMoreUserReviews, reviewSelected } from '../actions/review.action';
import { deselectUser, loadUser, loadUserAggregates, selectUser, userProfilePicUpdate, userProfilePicUpdating } from '../actions/users/users.action';
import { Tabs } from '../router/tabs.constant';
import { fetchFollowAggregates } from '../services/follow-status/follow-status.service';
import * as locationService from '../services/location/location.service';
import { MOMENTS_LIST } from '../services/moments/moments.constants';
import * as fetchService from '../services/reviews/fetch-reviews.service';
import { uploadUserProfilePictureToFirebase } from '../services/user/user.service';
import Colors from '../styles/colors.styles';
import * as SceneType from '../types/scene.types';
import SearchItem from './discover/search-item.component';
import FollowButton from './follow-button/follow-button.component';
import ImgIcons from './img-icons/img-icons';
import RegistrationRedirect from './login/registration-redirect.compnent';
import ReviewRows from './profile/review-rows.component';
import UserItem from './profile/userItem.component';
import MediaInfoSection from './timeline/media-info-section.component';
import UnfollowButton from './unfollow-button/unfollow-button.component';




const Tab = props => {
  const { value, text, isTabActive } = props;
  return (
    <View style={styles.tab}>
      <Text style={isTabActive && styles.activeTab}>{value}</Text>
      <Text style={isTabActive && styles.activeTab}>{text}</Text>
    </View>
  );
};

class Profile extends Component {
  constructor(props) {
    super(props);
    // this.recommendations = {};
    this.state = {
      avatarSource: '',
      currentCoords: null,
      showTopLoadingIndicator: false,
      numFollowers: 0,
      numFollowing: 0,
      loadingMoreReviews: false,
      updatingProfilePic: false,
      recommendedKeysArray: []
    };
    this.userFollowers = [];
    this.userFollowing = [];


    this.currentIndex = 0;
    this.batchSize = 7;

    this.bookmarkKeysArray = [];
    this.currentBookmarkIndex = 0;
  }

  componentDidMount() {
    const { selectedUser, photoUrl } = this.props;
    const profileImage = photoUrl || '';

    this.setState({ avatarSource: profileImage });
    this.loadProfile(selectedUser);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showTopLoadingIndicator && !prevState.showTopLoadingIndicator) {
      this.props.fetchReviewExtension();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedUser, selectedTabIndex } = nextProps;
    const currentPhotoUrl = this.props.photoUrl;
    const nextPhotoUrl = nextProps.photoUrl || '';

    if (currentPhotoUrl !== nextPhotoUrl) {
      this.setState({
        avatarSource: nextPhotoUrl
      });
    }

    const currentUser = this.props.selectedUser;
    if (currentUser === selectedUser && (this.props.selectedTabIndex === nextProps.selectedTabIndex
      && nextProps.selectedTabIndex !== Tabs.profile)) { return; }

    if (currentUser !== selectedUser || selectedUser == null) {
      this.currentIndex = 0;
      this.setState({
        recommendedKeysArray: []
      });
    }

    const nextBookmarks = nextProps.bookmarks || {};
    const nextBookmarksLength = Object.keys(nextBookmarks).length;
    if (nextBookmarksLength === 0) {
      this.bookmarkKeysArray = [];
    } else if ((this.bookmarkKeysArray.length === 1 //edge case only have 1 bookmark
      || (this.bookmarkKeysArray.length !== nextBookmarksLength))
      && !_.isEmpty(nextBookmarks)) {
        this.currentBookmarkIndex = 0;
        this.bookmarkKeysArray = Object.keys(nextBookmarks)
        .filter((item) => {
          return nextBookmarks[item].bookmarked;
        })
        .sort();

        this.bookmarkKeysArray.forEach((item) => {
          const val = this.props.businesses[item];
          if (!val || !val.apiId) {
            this.props.fetchBusinessDetail(item, 'Restaurant');
          }
        });
    }

    if (this.navigatingFromAnotherTab(selectedTabIndex) || currentUser !== selectedUser) {
      this.loadProfile(selectedUser);
    }
  }

  fetchFollowAggregates = selectedUser => {
    fetchFollowAggregates(selectedUser).then(res => {
      const numFollowers = (res) ? res.numFollowers : 0;
      const numFollowing = (res) ? res.numFollowing : 0;

      this.setState({ numFollowers, numFollowing });

      this.props.fetchUserFollowers(selectedUser);
      this.props.fetchUserFollowing(selectedUser);
    });
  };

  fetchFollowingAggregates = follow => {
    if (follow == null) { return 0; }
    return Object.values(follow).filter(item => item.status).length;
  }

  loadUser = userId => {
    const { onLoadUser, userLoaded } = this.props;
    if (userLoaded && !userId) return;
    const selectedUser = userId || this.props.selectedUser;
    onLoadUser(selectedUser);
  };

  loadFollowingStatus = userId => {
    const { following, selectedUser, onLoadFollowingStatus } = this.props;

    if (selectedUser && following == null) {
      onLoadFollowingStatus(selectedUser);
    }
    if (userId) {
      onLoadFollowingStatus(userId);
    }
  };

  loadMostRecentReviews = userId => {
    this.props.fetchRecentReviews(userId);
  };

  loadMoreReviews = () => {
    const { canLoadMore, reviews, loading, reviewsLoading } = this.props;
    if (reviews && reviews.length > 0 && !loading && canLoadMore && !reviewsLoading) {
      this.props.loadMoreReviews(this.props.selectedUser);
    }
  };

  loadBookmarks = () => {
    const { bookmarks } = this.props;
    if (!_.isEmpty(bookmarks)) { //if(bookmarks)
      this.currentBookmarkIndex = 0;
      this.bookmarkKeysArray = Object.keys(bookmarks)
      .filter((item) => {
        return bookmarks[item].bookmarked;
      })
      .sort();
    }
  }

  navigatingFromAnotherTab = selectedTabIndex => {
    return this.props.selectedTabIndex !== Tabs.profile && selectedTabIndex === Tabs.profile;
  };

  onReviewPressed = review => {
    this.showReview(review);
  };

  onScroll = (event, offsetX, offsetY) => {
    const showTopLoadingIndicator = this.getShowTopLoadingIndicator(offsetY);
    if (this.state.showTopLoadingIndicator !== showTopLoadingIndicator) {
      this.setState({
        showTopLoadingIndicator
      });
    }
  };

  getShowTopLoadingIndicator = offsetY => {
    const { showTopLoadingIndicator } = this.state;

    if (!showTopLoadingIndicator && offsetY < -40) {
      return true;
    } else if (showTopLoadingIndicator && offsetY > -35) {
      return false;
    }
    return showTopLoadingIndicator;
  };

  showReview = review => {
    const { businessId, reviewId } = review;
    const reviewIds = [];
    reviewIds.push(reviewId);

    this.props.reviewSelected({
      businessId,
      ...review,
      reviewIds
    });

    Actions[this.props.mediaExecutorScene]({
      originator: SceneType.PROFILE
    });
  };

  isOwnProfile = (selectedUser) => {
    const { uid } = this.props;
    return selectedUser === uid;
  };

  isAtleastOneFieldInMomentTrue = (item) => {
    const keys = Object.keys(item);
    for (i = 0; i < keys.length; i++) {
      if (item[keys[i]].recommend === true) {
        return true;
      }
    }
    return false;
  }

  fetchCurrentUserRecommendations() {
    fetchService.fetchRecommendationsByUser(this.props.selectedUser).on('value', snapshot => {
        const val = snapshot.val() || {};
        // this.recommendations = val;
        this.setState({ recommendedKeysArray: Object.keys(val).filter((item) => {
            return this.isAtleastOneFieldInMomentTrue(val[item]);
        }).sort() });
    });
  }

  goBack = () => {
    Actions.pop();
  };

  followUser = (userId, followedUser) => {
    const { onFollowUser } = this.props;
    const selectedUser = userId || this.props.selectedUser;
    onFollowUser(selectedUser, followedUser);
  };

  unfollowUser = userId => {
    const { onUnfollowUser } = this.props;
    const selectedUser = userId || this.props.selectedUser;
    onUnfollowUser(selectedUser);
  };

  isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  fetchBusinessDataStartingAtCurrentIndex = () => {
    if (this.currentIndex < this.state.recommendedKeysArray.length) {
      const endIndex = this.state.recommendedKeysArray.length - this.currentIndex > this.batchSize ? this.batchSize + this.currentIndex - 1 : this.state.recommendedKeysArray.length - 1;
      for (i = this.currentIndex; i <= endIndex; i++) {
        const item = this.state.recommendedKeysArray[i];
        const val = this.props.businesses[item];
        if (!val || !val.apiId) {
        this.props.fetchBusinessDetail(item, 'Restaurant');
        }
      }
      this.currentIndex += this.batchSize;
    }
    }

  fetchBookmarksStartingAtCurrentIndex = () => {
    if (this.currentBookmarkIndex < this.bookmarkKeysArray.length) {
      const endIndex = this.bookmarkKeysArray.length - this.currentBookmarkIndex > this.batchSize ? this.batchSize + this.currentBookmarkIndex - 1 : this.bookmarkKeysArray.length - 1;
      for (i = this.currentBookmarkIndex; i <= endIndex; i++) {
        const item = this.bookmarkKeysArray[i];
        const val = this.props.businesses[item];
        if (!val || !val.apiId) {
        this.props.fetchBusinessDetail(item, 'Restaurant');
        }
      }
      this.currentBookmarkIndex += this.batchSize;
    }
  }

  onChangeTab = ({ i, ref }) => {
    if (i === 4) {
      this.fetchBookmarksStartingAtCurrentIndex();
    }
    if (i === 1) {
      if (_.isEmpty(this.props.recommendations)) {
          this.fetchCurrentUserRecommendations();
      } else {
        const recommendations = this.props.recommendations[this.props.selectedUser];
        //if user had no recommendations, recommendations  would be undefined
        if (recommendations) {
        this.setState({ recommendedKeysArray: Object.keys(recommendations)
          .filter((item) => {
            return this.isAtleastOneFieldInMomentTrue(recommendations[item]);
        }).sort() });
        this.fetchBusinessDataStartingAtCurrentIndex();
        }
      }
  }
  };

  loadProfile = userId => {
    this.selectUser(userId);
    this.selectReviewAggregates(userId);
    this.loadUserReviews(userId);
  }

  selectUser = userId => {
    const { users } = this.props;
    this.props.selectUser(userId);

    //Don't reload user's profile  if it's already in the store
  if (!users.byId[userId]) {
      this.loadUser(userId);
    }
  };

  selectReviewAggregates = userId => {
    this.props.loadAggregatesForUser(userId);
    this.fetchFollowAggregates(userId);
    //TODO - this should be in its own function
    this.loadFollowingStatus(userId);
  }

  loadUserReviews = (selectedUser) => {
    const { visits } = this.props;
    const userVisits = visits.userVisitIds[selectedUser];

    locationService.getCurrentLocation().then(loc => {
      this.setState({ currentCoords: loc });
      if (userVisits == null || userVisits.length <= 0) {
        this.props.fetchReviews(selectedUser);
        // Note: All newly created reviews are already added to
        // the store for own user
      } else if (!this.isOwnProfile(selectedUser)) {
          this.loadMostRecentReviews(selectedUser);
      }
    });
  }

  renderBackButton = () => {
    return (
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={this.goBack}>
          <Icon style={styles.backButton} name="ios-arrow-back" size={35} />
        </TouchableOpacity>
      </View>
    );
  };

  onProfileImageTapped = () => {
    //Pick image here https://github.com/react-community/react-native-image-picker
    const options = {
      title: 'Select Avatar',
      quality: 0.7,
      customButtons: [
        { name: 'fb', title: 'Choose Photo from Facebook' },
      ],
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };
    this.props.userProfilePicUpdating(true);
    return ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        this.props.userProfilePicUpdating(false);
      } else if (response.error) {
        this.props.userProfilePicUpdating(false);
      } else if (response.customButton) {
        this.props.userProfilePicUpdating(false);
      } else {
        const { data } = response;
        const { uid } = this.props;
        return uploadUserProfilePictureToFirebase(data, uid)
        .then((res) => {
            this.props.userProfilePicUpdate(data);
            this.props.userProfilePicUpdating(false);
        })
        .catch((err) => {
          console.log(`failed: ${err}`);
          this.props.userProfilePicUpdating(false);
        });
    }
  });
};

  handleProfileImage = () => {
    if (this.state.avatarSource !== '') {
      return { uri: this.state.avatarSource };
      }
      return ImgIcons.defaultUser;
  };

  onPressBusiness = (item) => {
    this.props.onSelectBusiness(item);
    Actions[this.props.businessScene]();
  }

  renderProfile = () => {
    const { firstName, lastName, created, isUserProfilePicUpdating, selectedUser } = this.props;
    const dateCreated = created ? moment(created).format('MMMM YYYY') : '';
    const title = `${firstName} ${lastName}`;
    const text = `Member since ${dateCreated}`;

    return (
      <View style={styles.profileRow}>
        <TouchableOpacity onPress={() => { if (this.isOwnProfile(selectedUser) && !isUserProfilePicUpdating) { this.onProfileImageTapped(); } }}>
          <Image resizeMode="cover" source={this.handleProfileImage()} style={styles.userImageStyle}>
            { isUserProfilePicUpdating && (
              <MaterialIndicator color='white' size={20} animating />
            )}
          </Image>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{title}</Text>

          <View style={{ flexDirection: 'row' }}>
            { !this.isOwnProfile(selectedUser) && this.renderFollowButton(this.props.following) }
          </View>
        </View>
      </View>
    );
  };

  renderFollowButton = following => {
    if (following == null) return this.renderFollowLoading();
    const { isRequestActive } = this.props;
    return following.status ? (
      <UnfollowButton onUnfollow={!isRequestActive ? this.unfollowUser : () => { console.log('nothing called'); }} />
    ) : (
      <FollowButton onFollow={!isRequestActive ? this.followUser : () => { console.log('nothing called'); }} />
    );
  };

  renderFollowLoading = () => {
    return (
      <View style={styles.followLoadingButton}>
        <Text style={styles.loadingText}>Loading</Text>
      </View>
    );
  };

  renderTab = (name, page, isTabActive, onPressHandler, onLayoutHandler) => {
    const { value, text } = name;
    return (
      <TouchableOpacity
        // key={`${name}_${page}`}
        onPress={() => onPressHandler(page)}
        onLayout={onLayoutHandler}
      >
        <Tab value={value} text={text} isTabActive={isTabActive} />
      </TouchableOpacity>
    );
  };
  renderLowerInfoContainer = () => {
    const { aggregates } = this.props;
    let { sumRecommends, sumReviews } = aggregates || {};
    sumRecommends = sumRecommends || 0;
    sumReviews = sumReviews || 0;

    let noBookmarks = 0;
    if (this.bookmarkKeysArray.length > 0) {
      noBookmarks = this.bookmarkKeysArray.length;
    }
    return (
      <View style={styles.lowerInfoContainer}>
        <ScrollableTabView
          style={{ marginTop: 20 }}
          initialPage={0}
          renderTabBar={() => <ScrollableTabBar renderTab={this.renderTab} />}
          tabBarUnderlineStyle={{ backgroundColor: Colors.viewsRed2 }}
          onChangeTab={this.onChangeTab}
        >
          <ScrollView
            onScroll={({ nativeEvent }) => {
              if (this.isCloseToBottom(nativeEvent)) {
                this.loadMoreReviews();
              }
            }}
            scrollEventThrottle={16}
            style={{ paddingHorizontal: 16 }}
            tabLabel={{ value: sumReviews, text: 'Reviews' }}
          >
            {this.renderReviewsTimeline()}
          </ScrollView>
          <ScrollView
            onScroll={({ nativeEvent }) => {
            if (this.isCloseToBottom(nativeEvent)) {
              this.fetchBusinessDataStartingAtCurrentIndex();
            }
            }}
            scrollEventThrottle={16}
            style={{ paddingHorizontal: 16, marginBottom: 85 }}
            tabLabel={{ value: sumRecommends, text: 'Recommend' }}
          >
            {this.renderRecommended()}
          </ScrollView>
          <ScrollView tabLabel={{ value: this.fetchFollowingAggregates(this.props.userFollowers), text: 'Followers' }}>
            {this.renderFollowers()}
          </ScrollView>
          <ScrollView tabLabel={{ value: this.fetchFollowingAggregates(this.props.userFollowing), text: 'Following' }}>
            {this.renderFollowing()}
          </ScrollView>
          {this.isOwnProfile(this.props.selectedUser) && (
            <ScrollView
              onScroll={({ nativeEvent }) => {
                if (this.isCloseToBottom(nativeEvent)) {
                  this.fetchBookmarksStartingAtCurrentIndex();
                }
              }}
              scrollEventThrottle={16}
              style={{ paddingHorizontal: 16, marginBottom: 100 }}
              tabLabel={{ value: noBookmarks, text: 'Bookmarks' }}
            >
              {this.renderBookmarks()}
            </ScrollView>
          )}
        </ScrollableTabView>
        {/* {this.renderInnerInfoContainer(this.state.sumReviews, 'Reviews', styles.rightBorder)}
        {this.renderInnerInfoContainer(this.state.sumRecommends, 'Recommends')} */}
      </View>
    );
  };

  renderInnerInfoContainer = (upperText, lowerText, extraStyles = {}) => {
    return (
      <View style={[styles.lowerInnerInfo, extraStyles]}>
        <Text style={styles.lowerInnerInfoTitle}>{upperText}</Text>
        <Text style={styles.lowerInnerInfoSubtitle}>{lowerText}</Text>
      </View>
    );
  };

  renderListItem = item => {
    const distanceInMiles = locationService.distFromLocation(
      item.businessLocation,
      this.state.currentCoords
    );
    const distanceLabel = `${distanceInMiles} mi`;

    return (
      <MediaInfoSection
        key={this.props.selectedUser}
        id={this.props.selectedUser}
        title={item.userName}
        timeCreated={moment(item.createdTime).fromNow()}
        businessName={item.businessName}
        thumbnail={{ uri: item.thumbnail }}
        distance={distanceLabel}
        numViews={item.numViews}
        numLikes={item.numLikes}
        likeStatus={item.likeStatus || false}
        onPress={() => {
          this.onReviewPressed(item);
        }}
      />
    );
  };

  // RENDER FUNCTIONS FOR TABS

  renderReviewsTimeline() {
    return this.state.currentCoords ? (
      <ReviewRows reviewsList={this.props.reviews} itemPressed={this.onReviewPressed} />
    ) : null;
  }

  renderRecommended = () => {
    // const recommendations = this.props.recommendations ? this.props.recommendations[this.props.selectedUser] : this.recommendations;
    const recommended = [];
    if (this.currentIndex === 0) {
      this.fetchBusinessDataStartingAtCurrentIndex();
    }
    if (this.state.recommendedKeysArray.length > 0 && this.props.businesses && Object.keys(this.props.businesses).length > 0) {
      this.state.recommendedKeysArray.forEach(item => {
        const val = this.props.businesses[item];
        if (val && val.apiId) {
        recommended.push(this.props.businesses[item]);
        }
      });
    }
    return (
      <ScrollView style={{ marginBottom: 80 }}>
        {recommended.length > 0 && recommended.map(item => item && this.renderRestaurants(item))}
      </ScrollView>
    );
  };

  renderFollowers = () => {
    const { userFollowers } = this.props;
    if (!userFollowers) return;
    data = Object.values(userFollowers).filter(item => item.status);
    return (
      <FlatList
        keyboardShouldPersistTaps="always"
        data={data}
        renderItem={this.renderFlatListItem}
        keyExtractor={item => item.userId}
      />
    );
  };

  renderFollowing = () => {
    const { userFollowing } = this.props;
    if (!userFollowing) return;
    data = Object.values(userFollowing).filter(item => item.status);
    return (
      <FlatList
        keyboardShouldPersistTaps="always"
        data={data}
        renderItem={this.renderFlatListItem}
        keyExtractor={item => item.userId}
      />
    );
  };

  renderBookmarks = () => {
    const bookmarks = [];
    if (this.bookmarkKeysArray.length > 0 && this.props.businesses && Object.keys(this.props.businesses).length > 0) {
      this.bookmarkKeysArray.map(item => {
        const val = this.props.businesses[item];
        if (val && val.apiId) {
        bookmarks.push(this.props.businesses[item]);
        }
      });
    }
    return (
      <ScrollView style={{ marginBottom: 100 }}>
        {bookmarks.length > 0 && bookmarks.map(item => this.renderRestaurants(item))}
      </ScrollView>
    );
  };

  renderRestaurants = item => {
    if (!this.state.currentCoords || !item) {
      return null;
    }
    const moments = MOMENTS_LIST;
    const recommendedMoments = [];
    const { recommendations, selectedUser } = this.props;
    const { location } = item;
    distanceInMiles = locationService.distFromLocation(location, this.state.currentCoords) || '';
    const distanceLabel = `${distanceInMiles} mi`;
    const userRecommendations = recommendations ? recommendations[selectedUser] : this.recommendations;
    const recommended = userRecommendations && userRecommendations[item.businessId];
    if (recommended) {
      moments.map(itm => {
        if (recommended[itm] && recommended[itm].recommend) {
          recommendedMoments.push(itm);
        }
        return recommendedMoments;
      });
    }

    return (
      <View key={item.businessId} style={styles.businessItemContainer}>
        <SearchItem
          id={item.apiId}
          businessId={item.businessId}
          businessCategory={item.businessCategory}
          name={item.businessName}
          address={item.address}
          onPressItem={this.onPressBusiness}
          percentRecommend={item.percentRecommend}
          photoUri={item.photoUri}
          numOfRecommendations={item.numOfRecommendations}
          distanceLabel={distanceLabel}
          getDetails
          businessScene={this.props.businessScene}
          showRecommendations
          recommendedMoments={recommendedMoments}
        />
      </View>
    );
  };

  renderRecommendedRestaurants = item => {
    return (
      <View key={item.businessId} style={styles.recommendedItemContainer}>
        <Text>{item.businessName}</Text>
      </View>
    );
  };

  renderFlatListItem = ({ item }) => {
    let following;
    if (this.props.currentUserFollowing) {
      const currentUserFollowing = Object.values(this.props.currentUserFollowing);
      const index = currentUserFollowing.findIndex(
        user => user.userId === item.userId && user.status
      );
      following = index >= 0;
    }
    return (
      <UserItem
        item={item}
        following={following}
        follow={this.followUser}
        unFollow={this.unfollowUser}
        onPress={this.loadProfile}
      />
    );
  }

  render() {
    const { isAnonymous, selectedTabIndex } = this.props;
    const profileTab = selectedTabIndex === Tabs.profile;

    if (isAnonymous) {
      return <RegistrationRedirect showContinue={false} />;
    }

    return (
      <View style={styles.container}>
        {!profileTab && this.renderBackButton()}
        {this.renderProfile()}
        {/* {!ownProfile && this.renderFollowButton(this.props.following)} */}
        {this.renderLowerInfoContainer()}
        {/* {this.renderReviewsTimeline()} */}
      </View>
    );
  }
}

Profile.defaultProps = {
  firstName: '',
  lastName: ''
};

const styles = StyleSheet.create({
  backButtonContainer: {
    position: 'relative',
    width: 40,
    top:10,
    left: 15
  },
  backButton: {
    color: Colors.ViewsBlue
  },
  container: {
    // alignItems: 'center',
    flex: 1,
    width: Dimensions.get('window').width,
    paddingTop: 20 //for status bar
  },
  followLoadingButton: {
    justifyContent: 'center',
    backgroundColor: Colors.ViewsWhite,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.ViewsGray1,
    borderRadius: 20,
    flexDirection: 'row',
    paddingVertical: 5,
    width: 100
  },
  loadingText: {
    color: Colors.ViewsGray1
  },
  thumbnailContentContaner: {
    alignItems: 'center'
  },
  thumbnailIcon: {
    top: 5,
    left: 0
  },
  thumbnailTitle: {
    fontFamily: 'Avenir',
    fontSize: 14,
    width: '100%'
  },
  thumbnailText: {
    color: Colors.ViewsGray3,
    fontFamily: 'Avenir',
    fontSize: 12,
    width: '100%'
  },
  thumbnail: {
    height: 60,
    width: 60,
    borderRadius: 30
  },
  timeline: {
    width: Dimensions.get('window').width
  },
  lowerInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.ViewsGray2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.ViewsGray2,
    marginTop: 20,
    paddingVertical: 5
  },
  lowerInnerInfo: {
    alignItems: 'center',
    flex: 1
  },
  lowerInnerInfoTitle: {
    fontFamily: 'avenir',
    fontWeight: '700',
    fontSize: 21
  },
  lowerInnerInfoSubtitle: {
    color: Colors.ViewsGray3,
    fontFamily: 'avenir',
    fontSize: 12
  },
  rightBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: Colors.ViewsGray2
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 15,
    width: 85,
    marginRight: 5
  },
  activeTab: {
    color: Colors.viewsRed2
  },
  profileRow: {
    marginTop: 20,
    flexDirection: 'row',
    paddingLeft: 16,
    alignItems: 'center'
  },
  userInfo: {
    marginLeft: 12
  },
  lightText: {
    color: '#aaaaaa',
    fontSize: 13,
    marginLeft: 3
  },
  button: {
    width: 109,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff3366',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3366',
    marginLeft: 16
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold'
  },
  userImageStyle: {
    width: 84,
    height: 84,
    borderRadius: 42
  },

  userName: {
    fontSize: 17
  },
  recommendedItemContainer: {
    marginTop: 10
  }
});

const mapStateToProps = state => {
  const { profileCanLoadMore, profileLoading, selectedTabIndex, isUserProfilePicUpdating } = state.ui;
  const { businesses, visits, users } = state;
  const { selectedUser } = users;
  const userFollowers = state.user.followers && state.user.followers[selectedUser];
  const userFollowing = state.user.following && state.user.following[selectedUser];
  const recommendations = state.reviews.recommendations;
  const { reviewsLoading } = state.reviews;
  const followStatuses = state.followStatuses[state.user.uid];
  const { isRequestActive } = state.followStatuses;

  let user = state.user;
  let following = null;
  // Select the appropriate user
  if (selectedUser !== user.uid) {
    user = state.users.byId[selectedUser];

    // const followStatuses = state.followStatuses[state.user.uid];
    if (followStatuses) {
      const selectedUserFollowing = followStatuses.following[selectedUser];
      following = selectedUserFollowing != null ? selectedUserFollowing : null;
    }
  }

  const { aggregates, firstName, lastName, created, reviewsIds, viewedReviewList, bookmarks, photoUrl } = user || {};
  const reviews = reviewsIds ? reviewsIds.map(reviewId => state.reviews[reviewId]) : [];

  reviews.sort((a, b) => {
    if (moment(a.createdTime).isAfter(moment(b.createdTime))) {
      return -1;
    }
    if (moment(a.createdTime).isBefore(moment(b.createdTime))) {
      return 1;
    }
    return 0;
  });

  const canLoadMore =
    profileCanLoadMore[selectedUser] == null ? true : profileCanLoadMore[selectedUser];
  return {
    aggregates,
    canLoadMore,
    firstName,
    lastName,
    loading: profileLoading,
    created,
    uid: state.user.uid,
    reviews,
    photoUrl,
    selectedTabIndex,
    selectedUser,
    userLoaded: !!user,
    following,
    users,
    businesses,
    visits,
    bookmarks,
    userFollowers,
    userFollowing,
    currentUserFollowing: state.user.following ? state.user.following[state.user.uid] : null,
    recommendations,
    reviewsLoading,
    followStatuses,
    isAnonymous: user ? user.isAnonymous : false,
    isRequestActive,
    isUserProfilePicUpdating
  };
};

const selectedOwnProfile = (selectedUserId, userId) => {
  if (!selectedUserId) {
    return true;
  }
  if (selectedUserId && selectedUserId === userId) {
    return true;
  }
  return false;
};

const mapDispatchToProps = dispatch => {
  return {
    onExit: () => {
      dispatch(deselectUser());
    },
    userProfilePicUpdating: (status) => {
    dispatch(userProfilePicUpdating(status));
    },
    onFollowUser: (followedId, followedUser) => {
      dispatch(followUser(followedId, followedUser));
    },
    onUnfollowUser: followedId => {
      dispatch(unfollowUser(followedId));
    },
    onLoadUser: userId => {
      dispatch(loadUser({ userId }));
    },
    onLoadFollowingStatus: followedId => {
      dispatch(loadFollowingStatus(followedId));
    },
    reviewSelected: review => {
      dispatch(reviewSelected(review));
    },
    loadAggregatesForUser: userId => {
      dispatch(loadUserAggregates(userId));
    },
    fetchReviews: userId => {
      dispatch(fetchUserReviews(userId));
    },
    fetchReviewExtension: () => {
      dispatch(fetchReviewExtension());
    },
    fetchRecentReviews: userId => {
      dispatch(fetchMostRecentUserReviews(userId));
    },
    loadMoreReviews: userId => {
      dispatch(loadMoreUserReviews(userId));
    },
    fetchBusinessDetail: (businessId, businessCategory) => {
      dispatch(fetchBusinessDetail(businessId, businessCategory));
    },
    fetchUserFollowers: userId => {
      dispatch(fetchUserFollowers(userId));
    },
    fetchUserFollowing: userId => {
      dispatch(fetchUserFollowing(userId));
    },
    selectUser: userId => {
      dispatch(selectUser({ userId }));
    },
    onSelectBusiness: business => {
      dispatch(selectBusiness(business));
    },
    userProfilePicUpdate: imageUri => {
      dispatch(userProfilePicUpdate(imageUri));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);
