import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Animated, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import firebase from 'react-native-firebase';
import { getBottomSpace, getStatusBarHeight, ifIphoneX } from 'react-native-iphone-x-helper';
import { Actions } from 'react-native-router-flux';
import Share from 'react-native-share';
import { connect } from 'react-redux';
import { progressBarDetails } from '../../actions/review.action';
import FadeInOut from '../fade-in-out/fade-in-out.component';
import imgIcons from '../img-icons/img-icons';
import MediaViewerText from '../media-viewers/media-viewer-text/media-viewer-text.component';
// Components
import MediaViewer from '../media-viewers/media-viewer.component';
import ReviewDetails from '../media-viewers/review-details.component';
import ReviewStoryProgressBar from '../review-story-progress-bar/review-story-progress-bar-view.component';
import ViewsButton from '../views-button/views-button.component';

class MediaDecorator extends Component {
  componentDidMount() {
    this.updateProgressBarDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.receivedNewProgressBarDetails(nextProps)) {
      this.updateProgressBarDetails(nextProps);
    }
  }

  receivedNewProgressBarDetails = (nextProps) => {
    const { currentReviewIndex, duration, numberOfReviews } = nextProps;

    return this.props.currentReviewIndex !== currentReviewIndex ||
            this.props.duration !== duration ||
            this.props.numberOfReviews !== numberOfReviews;
  }

  updateProgressBarDetails = ({
    currentReviewIndex,
    duration,
    numberOfReviews,
    onProgressBarDetails
  }) => {
     /*
      Note: This allows consumer components playing a review to have their own progress component
      but still stay in sync.
    */
    onProgressBarDetails({
      currentIndex: currentReviewIndex,
      duration,
      numberOfReviews
    });
  }

  renderProgressBar = ({
    currentReviewIndex,
    duration,
    smoothProgressBar,
    numberOfReviews,
    hideDetails,
    showProgressBar
  }) => {
    let progressBarStyle = styles.progressBar;
    if (hideDetails) {
      progressBarStyle = [styles.progressBar, styles.bottomProgressBar];
    }

    if (!showProgressBar) return;

    return (
      <Animated.View style={progressBarStyle}>
        <ReviewStoryProgressBar
          currentIndex={currentReviewIndex}
          duration={duration}
          smoothBar={smoothProgressBar}
          numberOfReviews={numberOfReviews}
        />
      </Animated.View>
    );
  };

  renderReviewDetails = (isUserReview) => {
    const {
      likeButtonPressed,
      review,
      onLongPress,
      onPress,
      recommended,
      showReviewDetails,
      profilePic,
      viewLikes,
    } = this.props;
    const { 
      likesUserIds, 
      viewsUserIds, 
      userId 
    } = review;

    const viewsLikesUserIds = [];
    new Set([
      ...(likesUserIds || []),
      ...(viewsUserIds || [])
    ]).forEach(id => {
      viewsLikesUserIds.push(id);
    });
    
    const profilePicUrl = profilePic(userId);

    return (
      <FadeInOut
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <ReviewDetails
          likeButtonPressed={likeButtonPressed}
          review={review}
          recommended={recommended}
          showReviewDetails={showReviewDetails}
          onShareButtonPressed={this.onSharePress}
          profilePicUrl={profilePicUrl}
          showViewsLikesUsersDisabled={!isUserReview}
          showViewLikesUsers={viewLikes}
          viewsLikesUserIds={viewsLikesUserIds}
        />
      </FadeInOut>
    );
  };

  renderMediaViewerText = (text, textStyles) => {
    return (
      <View style={styles.mediaViewerTextContainer}>
        <MediaViewerText text={text} textStyles={textStyles} />
      </View>
    );
  };

  // renderLikes = (review, likeButtonPressed) => {
  //   const { numLikes, likeStatus } = review;
  //   return (
  //     <View style={styles.likesContainer}>
  //       <LikeButton
  //         selected={likeStatus}
  //         numberOfLikes={numLikes}
  //         onPress={() => likeButtonPressed(likeStatus)}
  //         image={imgIcons.heartBtn}
  //       />
  //       <TouchableOpacity onPress={this.handleShare}>
  //         <Image source={imgIcons.shareBtn} />
  //       </TouchableOpacity>
  //     </View>
  //   );
  // };

  renderViews = numViews => {
    return (
      <View style={styles.viewsContainer}>
        <ViewsButton numberOfViews={numViews} />
      </View>
    );
  };
  renderIcons = () => {
    return (
      <View style={styles.icons}>
        <TouchableOpacity onPress={this.onExitPressed}>
          <Image source={imgIcons.backBtn} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onSharePress}>
          <Image source={imgIcons.shareBtn} />
        </TouchableOpacity>
      </View>
    );
  };

  onExitPressed = () => {
    Actions.pop();
  };

  onSharePress = () => {
    const { review, currentReviewIndex } = this.props;
    const bundleId = 'org.reactjs.native.views';
    const appStoreId = '1316306766';

    const link = new firebase.links.DynamicLink(
      this.reviewLink(review, currentReviewIndex), 'viewsapp.page.link')
      .ios.setBundleId(bundleId)
      .ios.setAppStoreId(appStoreId)
      .navigation.setForcedRedirectEnabled(true);

    firebase.links().createShortDynamicLink(link, 'UNGUESSABLE')
    .then((url) => {
      const shareOptions = {
           title: 'Watch this Review',
           message: 'Check out this review',
           url,
           subject: 'Share Link' //  for email
         };
      return Share.open(shareOptions);
    })
    .then((res) => {
      console.log(`share sucess, ${res}`);
    })
    .catch((err) => {
      console.log(`share failed ${err}`);
    });
  };

  reviewLink = (review, currentReviewIndex) => {
    const { reviewId, visitId, businessId } = review;
  return `https://viewsapp.com?reviewId=${reviewId}&visitId=${visitId}&businessId=${businessId}&reviewStartIndex=${currentReviewIndex}`;
  };

  render() {
    const {
      review,
      onDuration,
      onVideoEnd,
      videoPaused,
      likeButtonPressed,
      hideDetails,
      userProfilePressed,
      recommended,
      showReviewDetails,
      isClicked,
      currentReviewIndex
    } = this.props;

    const { mediaPath, mediaType, numViews, text, textStyles, isUserReview } = review;

    return (
      <MediaViewer
        mediaType={mediaType}
        uri={mediaPath}
        onDuration={onDuration}
        onVideoEnd={onVideoEnd}
        videoPaused={videoPaused}
        rightExitButton
        hideExit={hideDetails}
      >
        <View style={styles.overlay}>
          { this.renderProgressBar(this.props)}
          {hideDetails && this.renderIcons()}
          {!hideDetails && (
            <View style={{ flex: 1 }}>
              { this.renderReviewDetails(isUserReview) }
              {/* {this.renderLikes(review, likeButtonPressed)} */}
              {/* {this.renderViews(numViews)} */}
              {text && this.renderMediaViewerText(text, textStyles)}
            </View>
          )}
        </View>
      </MediaViewer>
    );
  }
}
MediaDecorator.PropTypes = {
  review: PropTypes.objectOf({
    businessName: PropTypes.string,
    createdTime: PropTypes.string,
    mediaType: PropTypes.string,
    mediaPath: PropTypes.string,
    numLikes: PropTypes.number,
    text: PropTypes.string,
    userName: PropTypes.string
  }).isRequired,
  onVideoEnd: PropTypes.func,
  likeButtonPressed: PropTypes.func,
  onProgressBarDetails: PropTypes.func,
  showProgressBar: PropTypes.bool,
  smoothProgressBar: PropTypes.bool,
  videoPaused: PropTypes.bool,
  likeStatus: PropTypes.bool,
  numLikes: PropTypes.string,
  userProfilePressed: PropTypes.func,
  hideDetails: PropTypes.bool
};

MediaDecorator.defaultProps = {
  onProgressBarDetails: () => {},
  showProgressBar: true,
  smoothProgressBar: false,
  userProfilePressed: PropTypes.func
};

const styles = StyleSheet.create({
  bottomProgressBar: {
    top: undefined
    // bottom: 10
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  likesContainer: {
    position: 'absolute',
    bottom: 175,
    right: 0
  },
  viewsContainer: {
    position: 'absolute',
    top: 20,
    left: 140
  },
  mediaViewerTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    ...ifIphoneX({
      bottom: getBottomSpace() + 100
    }, {
      bottom: 100
    })
  },
  progressBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    ...ifIphoneX({
      top: getStatusBarHeight(true)
    }, {
      top: 10
    })
  },
  icons: {
    width: '100%',
    position: 'absolute',
    top: 40,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }

  // STYLES FOR REVIEW INFO
});

const mapDispatchToProps = (dispatch) => {
  return {
    onProgressBarDetails: (details) => dispatch(progressBarDetails(details))
  };
};

export default connect(null, mapDispatchToProps)(MediaDecorator);
