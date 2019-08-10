import { Actions } from 'react-native-router-flux';
import React, { Component } from 'react';
import { Text } from 'react-native';
import { connect } from 'react-redux';
import MediaScroller from './media-scroller.component';
import { saveLikeAction, saveViewAction } from '../../actions/review.action';
import { selectUser } from '../../actions/users/users.action';
import * as mediaHelperService from '../../services/media/media-helper.service';
import RegistrationRedirect from '../login/registration-redirect.compnent';

class MediaExecutor extends Component {
  /*
   * Review[][], an array of review arrays
   */
  reviewsCollectionList;
  state = {
    reviewsListIndex: 0
  };
  /**
   * Handle the toggling (on/off) when like button is clicked
   */
  handleLikeButtonPress = reviewDetails => {
    const { numLikes, likeStatus } = reviewDetails;
    const newLikeStatus = !likeStatus;

    Object.assign(reviewDetails, { numLikes, likeStatus: newLikeStatus });
    this.updateLikes(reviewDetails);
  };

  handleUserProfilePress = userId => {
    const { userScene } = this.props;

    this.props.selectUser(userId);
    Actions[userScene]();
  };

  viewTimerElapsed = reviewDetails => {
    this.handleViews(reviewDetails);
  };

  updateLikes = reviewDetails => {
    this.props.saveLikes(reviewDetails);
  };

  handleViews = reviewDetails => {
    if (!reviewDetails) {
      return;
    }

    const { numViews } = reviewDetails;
    Object.assign(reviewDetails, { numViews });
    this.props.saveViews(reviewDetails);
  };

  handleViewLikes = (reviewDetails) => {
    const {
      numViews,
      numLikes,
    } = reviewDetails;

    let {      
      likesUserIds, 
      viewsUserIds 
    } = reviewDetails;
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

  handleMediaScrollerFinished = () => {
    if (this.state.reviewsListIndex < this.reviewsCollectionList.length - 1) {
      this.setState({ reviewsListIndex: this.state.reviewsListIndex + 1 });
    } else {
      Actions.pop();
    }
  };

  getMedia = () => {
    if (!this.reviewsCollectionList) {
      const { business, businessReviews, reviews, visits, user, originator, isShowingLinkReview } = this.props;
      this.reviewsCollectionList =
        mediaHelperService.aggregateMediaDetails(
          business,
          businessReviews,
          visits,
          reviews,
          user,
          originator,
          isShowingLinkReview
        ) || [];
    }

    return this.reviewsCollectionList[this.state.reviewsListIndex];
  };

  getProfilePic = (userId) => {
    const { userProfilePics, user } = this.props;
    const { uid } = user;
    if (userId !== uid) {
      if (userProfilePics[userId] !== undefined) {
          return userProfilePics[userId];
      }
        return '';
    }
    return user.photoUrl;
  };

  getFirstReviewToWatch = () => {
    const { businessReviews, reviews, originator, isShowingLinkReview, reviewStartIndex } = this.props;
    return mediaHelperService.getFirstReviewToWatch(businessReviews, reviews, originator, isShowingLinkReview, reviewStartIndex);
  };

  render() {
    if (this.props.user.isAnonymous) {
      return (
        <RegistrationRedirect />
      );
    }
      return (
        <MediaScroller
          beginningIndex={this.getFirstReviewToWatch()}
          visible={!this.props.likesViewsModalShowing}
          media={this.getMedia()}
          onFinished={this.handleMediaScrollerFinished}
          onPress={this.handleLikeButtonPress}
          onViewTimerElapsed={this.viewTimerElapsed}
          hideDetails={this.props.hideDetails}
          progressBarPosition={this.props.progressBarPosition}
          onUserProfilePress={this.handleUserProfilePress}
          recommended={this.props.recommended}
          profilePic={this.getProfilePic}
          viewLikes={this.handleViewLikes}
        />
      );
  }
}
const mapStateToProps = state => {
  const { businesses, businessReviews, reviews, visits, ui, user, users } = state;
  const { likesViewsModalShowing } = ui;
  const { byId } = users;
  const { businessId } = businessReviews;
  const business = businesses[businessId];

  return { 
    businessReviews, 
    business,
    likesViewsModalShowing, 
    reviews, 
    visits, 
    user, 
    userProfilePics: byId.userProfilePics 
  };
};

const mapDispatchToProps = dispatch => {
  return {
    saveLikes: reviewExtension => dispatch(saveLikeAction(reviewExtension)),
    saveViews: reviewExtension => dispatch(saveViewAction(reviewExtension)),
    selectUser: userId => {
      dispatch(selectUser({ userId }));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MediaExecutor);
