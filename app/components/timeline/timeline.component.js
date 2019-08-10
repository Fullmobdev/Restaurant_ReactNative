import React, { Component } from 'react';
import { NetInfo, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import DropdownAlert from 'react-native-dropdownalert';
import moment from 'moment';

import * as SceneType from '../../types/scene.types';
import MediaInfoSection from './media-info-section.component';
import { Tabs } from '../../router/tabs.constant';
import * as locationService from '../../services/location/location.service';
import { ConnectionType } from '../../types/app-state.types';

import {
  fetchReviews,
  fetchReviewExtension,
  watchFirebaseForUpdates,
  loadMostRecentReviews,
  loadMoreReviews,
  reviewSelected,
  getAllRecommendations,
  fetchReviewsForVisitId,
} from '../../actions/review.action';
import { businessSelected, fetchBusinessNeighborhood } from '../../actions/business.action';
import { createExperience } from '../../actions/experience.action';
import { selectUser } from '../../actions/users/users.action';
import TimelinePresentation from './timeline-presentation.component';
import TimelineHeader from './timeline-header.component';
import NewPostButton from '../new-post-button/new-post-button.component';
import Experience from './experience.component';
import { timelineReviewClick } from '../../actions/timeline/timeline.actions';


class Timeline extends Component {
  constructor(props) {
    super(props);
    this.topmostItemHeight = 450; //height of cell
    this.currentCoords = null;
    this.reviewStartIndex = 0;

    this.state = {
      listYOffset: 0,
      newItemsAvailable: false,
      lockingYOffset: null,
      networkIsConnected: true,
      showTopLoadingIndicator: false,
      experienceModalVisible: true
    };
  }

  queryObjectFromUrl = (url) => {
    query = {};
    url.substr(url.indexOf('?') + 1).split('&').forEach((part) => {
      p = part.split('=');
      query[p[0]] = p[1];
    });
    return query;
  };

  componentWillReceiveProps(nextProps) {
    const { connectionType, error, linkReviews, reviews, selectedTabIndex } = nextProps;
    if (connectionType !== this.props.connectionType) {
      this.handleConnectionChange(connectionType !== ConnectionType.none);
    }

    if (!(this.props.linkReviews) && (linkReviews)) {
      const { mediaExecutorScene } = this.props;
      this.navigateToNextScene(mediaExecutorScene, true, true, this.reviewStartIndex);
    }

    if (this.props.reviews !== reviews || error !== this.props.error) {
      if (error) {
        this.showErrorAlert('Error', error);
      }
      if (this.receivedNewReviews(this.props.reviews, reviews)) {
        //If it makes it here that means a review was added
        this.lockListYOffset();
        this.setState({ newItemsAvailable: true });
      }
    }

    this.handleTabNavigation(selectedTabIndex);
  }

  receivedNewReviews = (previousReviews, currentReviews) => {
    return previousReviews.length > 0 && previousReviews[0].reviewId !== currentReviews[0].reviewId;
  };

  handleTabNavigation = selectedTabIndex => {
    if (selectedTabIndex == null) {
      return;
    }

    if (this.navigatingToAnotherTab(selectedTabIndex)) {
      this.detachListeners();
    } else if (this.navigatingFromAnotherTab(selectedTabIndex)) {
      // this.loadMostRecentReviews();
    }
  };

  navigatingToAnotherTab = selectedTabIndex => {
    return this.props.selectedTabIndex === Tabs.timeline && selectedTabIndex !== Tabs.timeline;
  };

  navigatingFromAnotherTab = selectedTabIndex => {
    return this.props.selectedTabIndex !== Tabs.timeline && selectedTabIndex === Tabs.timeline;
  };

  componentDidMount() {
    const { initialLink } = this.props;
    if (initialLink !== '' && initialLink) {
      const initialLinkData = this.queryObjectFromUrl(initialLink);
      this.reviewStartIndex = parseInt(initialLinkData.reviewStartIndex, 10);
      this.props.fetchReviewsForVisitId(initialLinkData.visitId);
     }
    this.loadReviews();

    const isConnected = this.props.connectionType !== ConnectionType.none;
    this.setState({ networkIsConnected: isConnected });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showTopLoadingIndicator && !prevState.showTopLoadingIndicator) {
      this.props.fetchReviewExtension();
    }
  }

  loadMostRecentReviews = () => {
    this.props.loadMostRecentReviews();
    //this.props.watchFirebaseForUpdates();
  };

  loadReviews = () => {
    //Get current location
    if (this.currentCoords) {
      return;
    }
    locationService.getCurrentLocation().then(loc => {
      this.currentCoords = loc;

      //fetch reviews initially, then turn on connection for items added
      this.props.fetchReviews(5);
      //TODO - this should be changed to fetch recommendations only for loaded reviews
      //this.props.fetchRecommendations();
      this.props.getAllRecommendations();
      this.props.watchFirebaseForUpdates();
    });
  };

  detachListeners = () => {
    NetInfo.isConnected.removeEventListener('networkChange', this.handleConnectionChange);
  };

  handleConnectionChange = isConnected => {
    this.setState({ networkIsConnected: isConnected });
    if (!isConnected && this.dropdown) {
      const errorMessage = "We're having trouble connecting to Views right now. Try again later";
      //this.showErrorAlert('No network connectivity', errorMessage); //TODO -revisit alerts
    }
  };

  showErrorAlert = (errorTitle, errorMessage) => {
    if (this.dropdown) {
      this.dropdown.alertWithType('error', errorTitle, errorMessage);
    }
  };

  percentNumberStringFromDecimal = decimal => {
    return (Math.round(decimal) * 100).toString();
  };

  onScrollBeginDrag = () => {
    this.setState({
      lockingYOffset: this.state.lockingYOffset ? false : this.state.lockingYOffset
    });
  };

  onMomentumScrollEnd = event => {
    this.setState({
      listYOffset: event.nativeEvent.contentOffset.y
    });
  };

  onScroll = (event, offsetX, offsetY) => {
    const showTopLoadingIndicator = this.getShowTopLoadingIndicator(offsetY);
    let newItemsAvailable = this.state.newItemsAvailable;

    if (this.state.newItemsAvailable === true && !this.state.lockingYOffset) {
      newItemsAvailable = false;
    }

    this.setState({
      showTopLoadingIndicator,
      newItemsAvailable
    });
    //handle scroll up
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

  // Able to get called twice (for example when scrolling up twice)
  handleLoadMore = () => {
    if (this.props.reviews && !this.props.timelineLoading) {
      this.props.loadMoreReviews();
    }
  };

  lockListYOffset = () => {
    const listYOffset = this.state.listYOffset;
    const cellHeight = this.topmostItemHeight;
    const newYOffset = listYOffset + cellHeight;

    this.listRef.scrollToOffset(0, newYOffset, false);
    this.setState({ listYOffset: newYOffset, lockingYOffset: true });
  };

  onNewAvailablePressed = () => {
    this.listRef.scrollToTop(true);
    this.setState({ newItemsAvailable: false });
  };

  onReviewPressed = (reviewItem, recommended) => {
    this.props.timelineReviewClick();
    this.showReview(reviewItem, recommended);
  };

  onCapturePressed = () => {
    Actions[this.props.nextScene]();
  };

  onLocationPressed = () => {
    Actions[this.props.heatMapScene]({
      currentCoords: this.currentCoords
    });
  };

  onSelectUser = userId => {
    const { 
      isAnonymous, 
      registrationRedirectScene, 
      userScene 
    } = this.props;

    if (isAnonymous) { 
      Actions[registrationRedirectScene]();
      return; 
    }

    this.props.selectUser({ userId });
    this.navigateToNextScene(userScene);
  };

  onSelectBusiness = (item) => {
    const { businessId, businessCategory } = item;
    this.props.businessSelected(businessId, businessCategory);
    this.navigateToNextScene(this.props.businessScene);
  };

  showReview = (reviewItem, recommended) => {
    const { businessId, firstReviewToWatchIndex, reviewId } = reviewItem;
    const reviewIds = [];
    reviewIds.push(reviewId);

    this.props.reviewSelected({
      businessId,
      index: firstReviewToWatchIndex,
      reviewIds
    });

    const { mediaExecutorScene } = this.props;
    this.navigateToNextScene(mediaExecutorScene, recommended, false);
  };

  showLikesViewsModal = (reviewItem) => {
    const {
      numViews,
      numLikes,
    } = reviewItem;

    let {      
      likesUserIds, 
      viewsUserIds 
    } = reviewItem;
    likesUserIds = likesUserIds || [];
    viewsUserIds = viewsUserIds || [];

    const likesUsers = likesUserIds.map(userId => { return { userId }; });
    const viewsUsers = viewsUserIds.map(userId => { return { userId }; });

    const props = {
      numViews,
      numLikes,
      likesUsers,
      viewsUsers,
    };
    Actions[this.props.likesViewsScene](props);
  }

  navigateToNextScene = (scene, recommended, isShowingLinkReview, reviewStartIndex) => {
    Actions[scene]({ originator: SceneType.TIMELINE, recommended, isShowingLinkReview, reviewStartIndex });
  };

  isExperienceNotificationPending = () => {
    let notificationPending = false;
    const currentTime = moment(moment.utc().format());

    const pendingExperiences = this.props.pendingExperiences;
    Object.keys(pendingExperiences).forEach(visitId => {
      const experience = pendingExperiences[visitId];
      if (experience) {
        const reviewCreatedTime = experience.createdTime;
        const duration = moment.duration(currentTime.diff(moment(reviewCreatedTime)));
        const elapsedHours = duration.asHours();
        if (elapsedHours >= 24) { //Only start notifying users to give ratings after 24 hours
          notificationPending = true;
        }
      }
    });
    return notificationPending;
  };

  createExperienceNotification = () => {
    const pendingExperiences = this.props.pendingExperiences;
    const reviewDetails = {};

    Object.keys(pendingExperiences).forEach(experienceKey => {
      const experience = pendingExperiences[experienceKey];
      if (experience) {
        reviewDetails.businessName = experience.businessName;
        reviewDetails.businessId = experience.businessId;
        reviewDetails.visitId = experienceKey;
        reviewDetails.reviewCreated = experience.createdTime;
      }
    });
    return (
      <Experience
        businessId={reviewDetails.businessId}
        businessName={reviewDetails.businessName}
        visitId={reviewDetails.visitId}
        reviewCreated={reviewDetails.reviewCreated}
        experienceModalVisible={this.state.experienceModalVisible}
        onCancelExperience={this.onCancelExperience}
        onSubmitExperience={this.onSubmitExperience}
      />
    );
  }

  onSubmitExperience = (businessId, visitId, rating, selectedTags) => {
    this.props.createExperience(businessId, visitId, rating, selectedTags);
  };

  onCancelExperience = () => {
    this.setState({ experienceModalVisible: false });
  };

  loadBusinessNeighborhood = (item) => {
    const { businessId, businessLocation, reviewId } = item;
    this.props.fetchBusinessNeighborhood(businessId, businessLocation, reviewId);
  }

  renderListItem = (item, index) => {
    const {
      userName,
      thumbnail,
      createdTime,
      businessName,
      percentRecommend,
      businessLocation,
      neighborhood,
      numViews,
      numLikes,
      likeStatus,
      mediaType,
      businessId,
      businessCategory,
      reviewId,
      userId,
      isUserReview,
      likesUserIds, 
      viewsUserIds
    } = item;

    let profilePicUrl = '';
    if (userId === this.props.uid) {
      profilePicUrl = this.props.photoUrl;
    } else if (this.props.userProfilePics[userId]) {
      profilePicUrl = this.props.userProfilePics[userId];
    }
    if (!this.currentCoords) {
      return null;
    }

    distanceInMiles = locationService.distFromLocation(businessLocation, this.currentCoords) || '';

    const distanceLabel = distanceInMiles ? `${distanceInMiles} mi` : null;
    const recommendations = this.props.recommendations;
    let recommended;
    if (recommendations && recommendations[userId] && recommendations[userId][businessId]) {
      recommended = Object.keys(recommendations[userId][businessId]).some(key => {
        return recommendations[userId][businessId][key].recommend === true;
      });
    }
    return (

      <MediaInfoSection
        //get height of last component added to list (only needed if items are different height)
        // onLayout={event => (this.topmostItemHeight = event.nativeEvent.layout.height)}
        firstItem={index === 0}
        id={item.userId}
        profilePic={profilePicUrl}
        businessId={businessId}
        reviewId={reviewId}
        showIndicator
        showNewIndicator={item.showNewIndicator}
        title={userName}
        thumbnail={{ uri: thumbnail }}
        timeCreated={moment.utc(createdTime).fromNow()}
        businessName={businessName}
        percentRecommend={this.percentNumberStringFromDecimal(percentRecommend)}
        distance={distanceLabel}
        businessLocation={businessLocation}
        neighborhood={neighborhood}
        numViews={numViews}
        numLikes={numLikes}
        likeStatus={likeStatus || false}
        isUserReview={isUserReview}
        likesUserIds={likesUserIds}
        viewsUserIds={viewsUserIds}
        speakerIcon={mediaType === 'mp4'}
        recommended={recommended}
        onPress={() => this.onReviewPressed(item, recommended)}
        onLoadBusinessNeighborhood={() => this.loadBusinessNeighborhood(item)}
        selectUser={this.onSelectUser}
        selectBusiness={() => this.onSelectBusiness(item)}
        onLikesCountPress={() => this.showLikesViewsModal(item)}
      />
    );
  };

  renderDropdown = () => {
    return (
      <DropdownAlert
        closeInterval={0}
        ref={ref => {
          this.dropdown = ref;
        }}
      />
    );
  };

  render() {

    return (
      <View style={{ flex: 1 }}>
        <TimelineHeader
          onPress={this.onCapturePressed}
          onLocationPressed={this.onLocationPressed}
        />

        <TimelinePresentation
          renderListItem={this.renderListItem}
          onScroll={this.onScroll}
          onScrollBeginDrag={this.onScrollBeginDrag}
          onMomentumScrollEnd={this.onMomentumScrollEnd}
          items={this.props.reviews}
          onEndReached={this.handleLoadMore}
          listRef={ref => (this.listRef = ref)}
          showLoadingFooter={this.props.timelineLoading}
          showTopLoadingIndicator={this.state.showTopLoadingIndicator}
        />

        <NewPostButton
          visible={this.state.newItemsAvailable}
          onPress={this.onNewAvailablePressed}
        />
        { this.isExperienceNotificationPending() && this.createExperienceNotification() }
        { this.renderDropdown() }
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { visitIds } = state.visits;
  const { viewedReviewList, visitsViewedStatus, uid, photoUrl, isAnonymous } = state.user;
  const { error, selectedTabIndex, timelineLoading } = state.ui;
  const { connectionType } = state.appState;
  const pendingExperiences = state.pendingExperience;
  const { userProfilePics } = state.users.byId;

  // Update reviews with user's like statuses
  Object.keys(viewedReviewList).forEach(reviewId => {
    const viewedReview = viewedReviewList[reviewId];
    const review = state.reviews[reviewId];

    if (review) {
      state.reviews[reviewId] = {
        ...review,
        likeStatus: viewedReview.likeStatus
      };
    }
  });

  //Got through each visit, and get the latest review associated. The latest
  //review will be displayed on the timeline.
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
    isAnonymous,
    connectionType,
    reviews: timelineReviews,
    error,
    selectedTabIndex,
    timelineLoading,
    recommendations: state.reviews.recommendations,
    linkReviews: state.reviews.linkReviews,
    pendingExperiences,
    userProfilePics,
    uid,
    photoUrl
  };
};

export default connect(
  mapStateToProps,
  {
    fetchReviewsForVisitId,
    businessSelected,
    reviewSelected,
    fetchReviews,
    fetchReviewExtension,
    fetchBusinessNeighborhood,
    watchFirebaseForUpdates,
    loadMostRecentReviews,
    loadMoreReviews,
    createExperience,
    getAllRecommendations,
    selectUser,
    timelineReviewClick
  },
)(Timeline);
