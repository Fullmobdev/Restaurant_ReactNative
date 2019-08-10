//Component to scroll through media (videos and images) by tapping on the screen
import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Dimensions,
  Image
} from 'react-native';
import { connect } from 'react-redux';
import {
  BarIndicator
} from 'react-native-indicators';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFetchblob from 'react-native-fetch-blob';

/**
 * What will happen if 50 videos are put in?
 * We should implement a mechanism that handles this well
 */
import MediaDecorator from '../media-decorator/media-decorator.component';

/**
 * Pass an array of media into this prop.
 * Each object in the array must be of the form
 * {uri: ..., mediaType: ...}
 */
class MediaScroller extends Component {
  constructor(props) {
    super(props);
    this.fetchSession = `FETCH_SESSION_${Date.now()}`;
    this.timerIsRunning = null;
    this.imageTimer = null;
    this.imageTimerStartTime = null;
    this.imageTimerPauseTime = null;
    this.viewingTimer = null;
    this.currentMediumId = null;
    this.click = false;
    this.state = {
      counter: props.beginningIndex,
      duration: null,
      media: [],
      videoPaused: false,
      showStatusPopup: false,
      showReviewDetails: false
    };
  }

  flushCache = () => {
    //Get rid of all files from this session
    RNFetchblob.session(this.fetchSession)
      .dispose()
      .then(() => {});
  }

  componentDidMount() {
    this.loadURIsAndMediaTypes(this.props.media);
    const uri = this.props.profilePic;
  }

  componentWillReceiveProps(nextProps) {
    const { beginningIndex, media } = nextProps;
    if (this.receivedNewMedia(this.props.media, media)) {
      this.setState({ counter: beginningIndex, media: [] });
      this.loadURIsAndMediaTypes(media);
    }
    this.handleVisibilityChange(this.props, nextProps);
  }

  receivedNewMedia = (previousMedia, currentMedia) => {
    return (previousMedia ? previousMedia[0] : {}).reviewId !== (currentMedia[0] || {}).reviewId;
  };

  handleVisibilityChange = (currentProps, nextProps) => {
    const { visible } = nextProps;
    if (currentProps.visible || !visible) {
      return;
    }
    if (this.imageTimerPauseTime) {
      this.playImageTimer();
    } else {
      this.setState({ videoPaused: false });
    }
  }

  componentWillUnmount() {
    this.flushCache();
    this.stopImageTimer();
  }

  /**
   * Load one piece of media at a time, after each piece is finished loading,
   * update the state and load the remainder of the media list recursively
   */
  loadURIsAndMediaTypes(mediaArray) {
    if (!mediaArray || mediaArray.length === 0) {
      return;
    }

    //TODO: Maybe need some better logic here for
    //      loading the videos. Maybe 5 at a time, keep track
    const currentMedia = mediaArray[0];
    this.fetchMedia(currentMedia.mediaPath, currentMedia.mediaType).then(response => {
      // update the state
      this.setState({
        media: this.state.media.concat([
          {
            ...currentMedia,
            mediaPath: response.data
          }
        ])
      });

      //then go on to the rest of the list
      const newArray = mediaArray.slice(1, mediaArray.length);
      this.loadURIsAndMediaTypes(newArray);
    });
  }

  /**
   * Fetch a piece of media from the server and save it locally.
   * Returns a promise with the response.data being the local uri to the file.
   */
  fetchMedia = (url, mediaType) => {
    return RNFetchblob.config({
      appendExt: mediaType,
      fileCache: true,
      session: this.fetchSession
    }).fetch('GET', url);
  };

  /**
   * UI Events
   */
  rightSidePressed = () => {
    this.goToNextMedia(true);
  };

  leftSidePressed = () => {
    //TODO: Animation to let user know he/she pressed back
    this.goToPreviousMedia(true);
  };

  goToNextMedia = (click = false) => {
    this.stopImageTimer();

    const { counter } = this.state;
    //Make sure counter isn't larger than the amount of media we have
    //And if we are on a loading view, we don't want the user to be
    //able to go to the next video before this one loads
    if (this.props.loop) {
      const newCounter = (this.state.counter + 1) % this.state.media.length;
      this.setState({ ...this.state, counter: newCounter, showReviewDetails: true });
    } else if (counter < this.props.media.length - 1) {
      this.setState({
        ...this.state,
        counter: this.state.counter + 1,
        showReviewDetails: true,
      });
    } else {
      this.props.onFinished();
    }
  };

  goToPreviousMedia = () => {
    this.stopImageTimer();

    if (this.state.counter > 0) {
      this.setState({ ...this.state, counter: this.state.counter - 1, showReviewDetails: true });
    }

    // //If this is the first video, restart it
    // if(this.state.counter === 0) {
    //   //...
    // }
  };

  stopImageTimer = () => {
    window.clearTimeout(this.imageTimer);
    this.imageTimer = null;
  };

  pauseImageTimer = () => {
    this.imageTimerPauseTime = Date.now();
    window.clearTimeout(this.imageTimer);
  };

  playImageTimer = () => {
    const elapsedTime = this.imageTimerPauseTime - this.imageTimerStartTime;
    const remainingTime = this.state.duration - elapsedTime;
    this.imageTimer = window.setTimeout(this.goToNextMedia, remainingTime);
    this.imageTimerStartTime = Date.now();
    this.imageTimerPauseTime = null;
  };

  startImageTimerIfNecessary = () => {
    const currentMedium = this.state.media[this.state.counter];
    if (currentMedium && currentMedium.mediaType !== 'mp4' && this.imageTimer === null) {
      this.imageTimer = window.setTimeout(this.goToNextMedia, 9999);
      this.imageTimerStartTime = Date.now();
      this.setState({ duration: 9999 });
    }
  };

  initializeViewingTimer = () => {
    const currentMedium = this.getCurrentMedium();
    if (currentMedium && this.currentMediumId !== currentMedium.reviewId) {
      this.currentMediumId = currentMedium.reviewId;
      this.viewingTimer = window.setTimeout(this.handleViewTimerElapsed, 3000);
    }
  };

  handleViewTimerElapsed = () => {
    window.clearTimeout(this.viewingTimer);
    const currentMedium = this.getCurrentMedium();
    this.props.onViewTimerElapsed(currentMedium);
  };

  handleScreenPress(event) {
    if (this.state.videoPaused) {
      this.setState({ showStatusPopup: true, videoPaused: false });
      return;
    }
    const { width } = Dimensions.get('window');
    // this.setState({ showReviewDetails: true });
    if (event.nativeEvent.locationX < width / 2) {
      this.leftSidePressed();
    } else {
      this.rightSidePressed();
    }
  }

  handleUserProfilePress = userId => {
    this.pause();
    this.props.onUserProfilePress(userId);
  };

  pause = () => {
    if (this.imageTimer != null) {
      this.pauseImageTimer();
    } else {
      this.setState({ videoPaused: true });
    }
  }

  handleLongPress = () => {
    if (!this.state.videoPaused) {
      this.setState({ showStatusPopup: true, videoPaused: true });
    }
  };

  handleViewLikes = (review) => {
    this.pause();
    this.props.viewLikes(review);
  }

  onDuration = duration => {
    this.setState({ duration });
  };

  onVideoEnd = () => {
    this.goToNextMedia();
  };

  renderPauseIcon = () => {
    const iconName = this.state.videoPaused ? 'ios-pause' : 'ios-play';
    return (
      <Animatable.View
        animation="zoomIn"
        duration={300}
        onAnimationEnd={() => this.setState({ showStatusPopup: false })}
        easing="ease-in-out"
        style={styles.statusPopup}
      >
        <Icon style={styles.statusPopupIcon} name={iconName} color={'white'} size={200} />
      </Animatable.View>
    );
  };

  renderMediaDecorator = currentMedium => {
    const { videoPaused } = this.state;
    this.startImageTimerIfNecessary();
    return (
      <MediaDecorator
        // Note: We use props.media contains all the reviews initially, while state.media keeps
        // concatenating fetched review media
        smoothProgressBar={this.props.smoothProgressBar}
        duration={this.state.duration}
        numberOfReviews={this.props.media.length}
        currentReviewIndex={this.state.counter}
        review={{ ...currentMedium }}
        onDuration={this.onDuration}
        onVideoEnd={this.onVideoEnd}
        onPress={(event) => { this.handleScreenPress(event); }}
        onLongPress={this.handleLongPress}
        videoPaused={videoPaused}
        likeButtonPressed={() => this.props.onPress(currentMedium)}
        hideDetails={this.props.hideDetails}
        userProfilePressed={this.handleUserProfilePress}
        recommended={this.props.recommended}
        showProgressBar={this.props.showProgressBar}
        showReviewDetails={this.state.showReviewDetails}
        profilePic={this.props.profilePic}
        isClicked={this.state.isClicked}
        viewLikes={() => this.handleViewLikes(currentMedium)}
      />
    );
  };

  renderLoadingView(thumbnail) {
    return (
      <View style={styles.loadingView}>
      <Image
        style={styles.fullScreen}
        source={{ uri: thumbnail }}
        blurRadius={9}
      />
      <BarIndicator style={styles.loadingView} color='white' count={5} size={25} />
      </View>
    );
  }

  getCurrentMedium = () => {
    return this.state.media[this.state.counter];
  };

  render() {
    this.initializeViewingTimer();
    const currentMedium = this.getCurrentMedium();
    const media = this.props.media;
    const counter = this.state.counter;
    const thumbnail = (media && media[counter]) ? media[counter].thumbnail : '';
    return (
      <TouchableWithoutFeedback
        style={styles.container}
        onPress={event => this.handleScreenPress(event)}
        onLongPress={event => this.handleLongPress(event)}
      >
        <View style={styles.container}>
          {currentMedium ? this.renderMediaDecorator(currentMedium) :
            this.renderLoadingView(thumbnail)}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

MediaScroller.propTypes = {
  loop: PropTypes.bool,
  media: PropTypes.arrayOf(
    PropTypes.shape({
      uri: PropTypes.string,
      mediaType: PropTypes.string,
      text: PropTypes.string
    })
  ),
  onFinished: PropTypes.func,
  showProgressBar: PropTypes.bool,
  smoothProgressBar: PropTypes.bool,
  userProfilePressed: PropTypes.func,
  beginningIndex: PropTypes.number
};

MediaScroller.defaultProps = {
  beginningIndex: 0,
  loop: false,
  showProgressBar: true,
  smoothProgressBar: false,
  userProfilePressed: () => {}
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusPopup: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  iconRow1: {
    paddingLeft: 10,
    paddingTop: 720,
    flexDirection: 'row',
    backgroundColor: 'blue'
  },
  iconRow2: {
    color: 'white',
    paddingLeft: 16,
    paddingTop: 5,
    flexDirection: 'row',
    backgroundColor: 'transparent'
  },
  textRow: {
    color: 'white',
    flexDirection: 'row',
    paddingTop: 13
  },

  statusPopupIcon: {
    backgroundColor: 'transparent'
  },
  loadingView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
});

export default MediaScroller;

