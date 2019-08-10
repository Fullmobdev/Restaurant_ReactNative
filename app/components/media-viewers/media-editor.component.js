import React, { Component } from 'react';
import ReactNative, {
  Animated,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  NetInfo,
  TouchableWithoutFeedback,
  UIManager,
  Image,
  Slider,
  CameraRoll
} from 'react-native';
import Modal from 'react-native-modal';

import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { BlurView } from 'react-native-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import GestureRecognizer from 'react-native-swipe-gestures';
import ScreenBrightness from 'react-native-screen-brightness';

// Services
import * as service from '../../services/media/media.service';

// Components
import ActionSheetModal from '../action-sheet-modal/action-sheet-modal.component';

import CommentInput from '../comment-input/comment-input.component';
import FilterSelect from '../filter-select/filter-select.component';
import ReviewBusinessRecommend from '../review-business-recommend/review-business-recommend.component';
import ReviewBusinessSearch from '../review-business-search/review-business-search.component';
import FilterViewer from './filter-viewer';
import Slide from '../slide/slide.component';
import SlideUp from '../slide-up/slide-up.component';
import Spinner from '../spinner/spinner';
import SwipeUpView from '../swipe-up-view/swipe-up-view.component';
import imgIcons from '../img-icons/img-icons';
import * as SceneType from '../../types/scene.types';

// Constants
import Colors from '../../styles/colors.styles';
import { Filters } from '../filters/filters.constants';
import DiscoverSearch from '../discover/discover-search.component';

// Actions
import {
  addReviewBusinessText,
  selectReviewBusiness
} from '../../actions/review-business/review-business.action';
import { createReview } from '../../actions/review.action';
import {
  momentFilterSelected,
  momentFilterCleared,
  momentURIChanged,
  filteredMomentPathSet
} from '../../actions/moment.action';
import { ConnectionType } from '../../types/app-state.types';
import { loadPlaceDetails } from '../../actions/search-business/search-business.action';

const FontColor = ({ color, onPress }) => {
  const colorStyle = [styles.color, { backgroundColor: color }];
  return <TouchableOpacity style={colorStyle} onPress={onPress} />;
};

class MediaEditor extends Component {
  constructor(props) {
    super(props);
    this.colors = [
      '#ffffff',
      '#000000',
      '#00b6ff',
      '#67a811',
      '#ffc100',
      '#ff7e00',
      '#ff3366',
      '#ff0000',
      '#cc008e',
      '#8e0eb3'
    ];
  }
  startingSwipeUpVal = 0;

  state = {
    filterEditMode: false,
    selectBusinessModalVisible: false,
    businessSearchVisible: true,
    postLoading: this.props.reviewUploadLoading,
    disabled: false,
    networkStatusisConnected: null,
    commentInputFocused: false,
    selectedFilter: null,
    swipeUpVal: new Animated.Value(0),
    selectedColor: 'white',
    fontSize: 16,
    brightness: 50,
    filtersVisible: false
  };

  showNetworkErrorAlert() {
    Alert.alert(
      'Error',
      'Your device is not connected to the internet. Please check your WiFi or cellular data connection'
    );
  }

  componentDidMount() {
   const isConnected = this.props.connectionType !== ConnectionType.none;
   this.setState({ networkStatusisConnected: isConnected });
  }

  handleConnectionChange = (prevConnectionType, connectionType) => {
    if (prevConnectionType === connectionType) { return; }

    const isConnected = connectionType !== ConnectionType.none;
    let newState = { networkStatusisConnected: isConnected };
    if (!isConnected) {
      newState = { ...newState, postLoading: false };
    }
    this.setState(newState);
};

  componentWillReceiveProps(nextProps) {
    const { connectionType } = nextProps;
    this.handleConnectionChange(this.props.connectionType, connectionType);

    if (nextProps.error !== this.props.error && nextProps.error) {
      Alert.alert('Error', nextProps.error);
    } else if (
      nextProps.reviewUploadLoading !== this.props.reviewUploadLoading &&
      nextProps.reviewUploadLoading === false
    ) {
      this.closeSelectBusinessModal();
    }
  }

  onSendPressed = () => {
    // this.blurCommentInput();
    this.setState({ selectBusinessModalVisible: true });
    const textStyles = { color: this.state.selectedColor, fontSize: this.state.fontSize };
    if (this.reviewText) {
      this.props.onAddReviewText(this.reviewText, textStyles);
    } else {
      this.props.onAddReviewText(null, textStyles);
    }
  };

  closeSelectBusinessModal = () => {
    this.setState({
      selectBusinessModalVisible: false,
      businessSearchVisible: true
    });
  };

  postReview = recommendation => {
    this.setState({
      postLoading: true,
      disabled: true
    });

    if (this.props.filterName) {
      const type = this.getMedia(this.props.mediaType);
      //sends a message to swift to save the image and onSave() is the callback function
      const filterComponentInstance = this.filterViewerInstance.getFilterComponentRef();
      UIManager.dispatchViewManagerCommand(
        ReactNative.findNodeHandle(filterComponentInstance),
        UIManager.FilterComponent.Commands.saveMedia,
        [type]
      );
      this.recommendation = recommendation;
    } else {
      this.saveReview(recommendation);
    }
  };

  onSave = path => {
    // this function is called with the file path of the saved filtered image
    //the following method dispatches an action to change the value of the uri in the store
    this.props.onFilteredMediaSaved(path.nativeEvent.filePath);
    this.saveReview(this.recommendation);
  };

  saveReview = (recommendation) => {
    this.props.onReviewBusiness(recommendation);
    this.setState({ postLoading: false, disabled: false, selectBusinessModalVisible: false });
    setTimeout(() => {
      Actions.popTo(SceneType.CAPTURE_TAB);
      Actions.popTo(this.props.timelineScene);
    }, 10);
  }

  onExitPressed = () => {
    service.deleteMediaAtLocalPath(this.props.uri);
    this.props.onExitTapped();
    this.props.onBackPressed();
    Actions.pop();
  };

  selectBusiness = business => {
    this.props.onSelectBusiness(business);
    this.props.onLoadPlaceDetails(business.id);
    this.setState({ businessSearchVisible: false });
  };

  renderSendButton = () => {
    return (
      <TouchableOpacity onPress={this.onSendPressed}>
        <Icon style={styles.controlOption} name="md-send" size={30} color="#fff" />
      </TouchableOpacity>
    );
  };

  renderBusinessModal = () => {
    const { business } = this.props;
    const { businessSearchVisible } = this.state;

    return (
      <ActionSheetModal
        onCloseModal={this.closeSelectBusinessModal}
        visible={this.state.selectBusinessModalVisible}
      >
        {!businessSearchVisible && business
          ? this.renderBusinessRecommend()
          : this.renderBusinessSearch()}
      </ActionSheetModal>
    );
  };

  renderBusinessRecommend = () => {
    return (
      <ReviewBusinessRecommend
        onPost={this.postReview}
        buttonTitle={this.renderButtonTitle.bind(this)}
        disabled={this.state.disabled}
      />
    );
  };

  renderButtonTitle = title => {
    return <Text>{title}</Text>;
  };

  renderBusinessSearch = () => {
    return (
      <ReviewBusinessSearch
        onCancel={this.closeSelectBusinessModal}
        onSelectBusiness={this.selectBusiness}
      />
    );
  };

  blurCommentInput = () => {
    this.setState({ commentInputFocused: false });
  };

  onCommentInputChangeText = text => {
    this.reviewText = text;
  };

  onCommentInputFocus = () => {
    this.setState({ commentInputFocused: true });
  };

  onDonePress = () => {
    this.setState({ commentInputFocused: false });
  };

  onSwipeUpMove = () => {
    this.setState({
      filtersVisible: true
    });
  };

  onSwipeUp = () => {
    this.setState({
      filtersVisible: true
    });
  };

  onGrant = () => {
    this.setState({ commentInputFocused: false });
  };

  onSwipeUpRelease = (evt, gestureState) => {
    const { dy } = gestureState;
    const { filterEditMode } = this.state;

    if (!filterEditMode) this.onSwipeReleaseFilterEditOff(dy);
    if (filterEditMode) this.onSwipeReleaseFilterEditOn(dy);
  };

  onSwipeReleaseFilterEditOff = dy => {
    // User swiped down, gesture doesn't turn on filters
    if (dy > 0) return;

    // User didn't swipe for long enough, keep filter edit off
    if (dy > -40) {
      this.setFilterEditMode(false);
    } else {
      // Turn filter edit on
      //video pause functionality here....
      const type = this.getMedia(this.props.mediaType);
      const filterComponentInstance = this.filterViewerInstance.getFilterComponentRef();
      UIManager.dispatchViewManagerCommand(
        ReactNative.findNodeHandle(filterComponentInstance),
        UIManager.FilterComponent.Commands.pauseVideo,
        [type]
      );
      this.setFilterEditMode(true);
    }
  };

  onSwipeReleaseFilterEditOn = dy => {
    // User swiped up, gesture doesn't turn off filters
    if (dy < 0) return;

    // Keep filter edit mode on
    if (dy < 40) {
      this.setFilterEditMode(true);
    } else {
      // Turn filter off
      //video unpause functionality here.
      const type = this.getMedia(this.props.mediaType);
      const filterComponentInstance = this.filterViewerInstance.getFilterComponentRef();
      UIManager.dispatchViewManagerCommand(
        ReactNative.findNodeHandle(filterComponentInstance),
        UIManager.FilterComponent.Commands.unpauseVideo,
        [type]
      );
      this.setFilterEditMode(false);
    }
  };

  setFilterEditMode = mode => {
    const { filterEditMode, swipeUpVal } = this.state;

    let toValue = 0;
    let callback = () => {
      swipeUpVal.extractOffset();
      this.setState({ filterEditMode: mode });
    };

    if (filterEditMode === mode) {
      callback = null;
    } else if (!filterEditMode && mode) {
      toValue = -160;
    } else if (filterEditMode && !mode) {
      toValue = 160;
    }

    Animated.timing(swipeUpVal, {
      toValue,
      duration: 300
    }).start(callback);
  };

  onSelectFilter = filter => {
    // this.setState({ selectedFilter: filter });
    this.props.onSelectFilter(filter);
  };

  selectColor = color => {
    this.setState({ selectedColor: color });
  };

  onValueChange = value => {
    this.setState({ fontSize: value });
  };

  onBrightnessChange = value => {
    this.setState({ brightness: value }, () => {
      ScreenBrightness.setBrightness(value / 100);
    });
  };

  handleDownload = () => {
    const { filterName, mediaType, uri } = this.props;
    const media = this.getMedia(mediaType);

    CameraRoll.saveToCameraRoll(uri)
    .then(() => {
      Alert.alert(`${media} successfully saved!`);
    })
    .catch((error) => {
      console.log(error);
    });
  };

  getMedia = (mediaType) => {
    return mediaType === 'png' ? 'Image' : 'Video';
  }

  renderInputs = () => {
    return (
      <View
        style={styles.inputsContainer}
        // translate
        // startingPosition={0}
        // endingPosition={80}
        // animatedValue={Animated.divide(Animated.multiply(-1, this.state.swipeUpVal), 2)}
      >
        <View style={styles.commentInputContainer}>
          <CommentInput
            blur={!this.state.commentInputFocused}
            onChangeText={this.onCommentInputChangeText}
            onFocus={this.onCommentInputFocus}
            color={this.state.selectedColor}
            focus={this.state.commentInputFocused}
            fontSize={this.state.fontSize}
            value={this.reviewText}
          />
        </View>
      </View>
    );
  };

  renderFilterSelect = () => {
    const { filterName, mediaType, uri } = this.props;

    return (
      <Modal
        isVisible={this.state.filtersVisible}
        onBackdropPress={() => this.setState({ filtersVisible: false })}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropColor="transparent"
      >
        <BlurView blurAmount={10} blurType="dark" style={styles.filtersContainer}>
          <FilterSelect
            filters={Filters}
            mediaUri={uri}
            mediaType={mediaType}
            onSelectFilter={this.onSelectFilter}
            selectedFilter={filterName}
          />
        </BlurView>
      </Modal>
    );
  };

  renderColorSelection = () => {
    return (
      <View style={styles.colorsContainer}>
        {this.colors.map(color => {
          return <FontColor key={color} onPress={() => this.selectColor(color)} color={color} />;
        })}
      </View>
    );
  };

  renderSlider = () => {
    return (
      <View style={styles.sliderContainer}>
        <Image source={imgIcons.track} style={styles.trackImage} />
        <Slider
          minimumValue={18}
          maximumValue={30}
          step={1}
          style={styles.slider}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          onValueChange={this.onValueChange}
        />
      </View>
    );
  };

  renderText = () => {
    return (
      <View style={styles.inputText}>
        <Text style={styles.reviewText}>{this.reviewText}</Text>
      </View>
    );
  };

  renderExitButton = () => {
    return (
      <TouchableOpacity onPress={this.onExitPressed}>
        <Icon style={styles.controlOption} name="ios-arrow-back" size={30} color="white" />
      </TouchableOpacity>
    );
  };

  renderTopControls = () => {
    const { commentInputFocused } = this.state;
    return (
      <View style={[styles.topButtonRow, styles.topButtonRowContainer]}>
        {!commentInputFocused && (
          <View style={[styles.topButtonRow, styles.topButtonRowContainer]}>
            <View>{this.renderExitButton()}</View>
            <View style={styles.rightIcons}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    filtersVisible: true
                  });
                }}
              >
                <Image style={styles.iconImage} source={imgIcons.filter} />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.onCommentInputFocus}>
                <Text style={styles.text}>Aa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {commentInputFocused && (
          <View style={[styles.topButtonRow, styles.topButtonRowContainer]}>
            <TouchableOpacity style={{ marginLeft: 8 }}>
              <Image style={styles.downloadIcon} source={imgIcons.alighnment} />
            </TouchableOpacity>
            <View style={styles.rightIcons}>
              <TouchableOpacity onPress={this.onDonePress}>
                <Text style={styles.text}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  renderControls = () => {
    return (
      <View>
        <View style={styles.bottomButtonRow}>
          <TouchableOpacity onPress={this.handleDownload}>
            <Image style={styles.downloadIcon} source={imgIcons.download} />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onSendPressed} style={styles.nextBtn}>
            <Text style={styles.next}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  render() {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80
    };
    const { commentInputFocused, selectBusinessModalVisible, businessSearchVisible } = this.state;
    const { business } = this.props;
    const overlayStyles = [styles.overlay];
    if (commentInputFocused) {
      overlayStyles.push(styles.overlayDark);
    }

    return (
      <View style={styles.container}>
        <Modal
          isVisible={selectBusinessModalVisible}
          onBackdropPress={() => this.setState({ selectBusinessModalVisible: false })}
          style={styles.modal}
          animationIn="slideInUp"
          animationOut="slideOutDown"
        >
          {!businessSearchVisible && business ? (
            <View style={styles.recommendBusinessContent}>{this.renderBusinessRecommend()}</View>
          ) : (
            <View style={styles.searchBusinessContent}>
              <DiscoverSearch tagBusiness onPressBusiness={this.selectBusiness} />
            </View>
          )}
        </Modal>
        <GestureRecognizer style={{ flex: 1 }} onSwipeUp={() => this.onSwipeUp()} config={config}>
          <FilterViewer
            filterName={this.props.filterName}
            style={styles.flex}
            uri={this.props.uri}
            onSave={this.onSave}
            ref={component => (this.filterViewerInstance = component)}
            mediaStyle={{
              transform: [
                {
                  scaleX: Animated.divide(this.state.swipeUpVal, 2).interpolate({
                    inputRange: [-80, 0],
                    outputRange: [0.7, 1],
                    extrapolate: 'clamp'
                  })
                },
                {
                  scaleY: Animated.divide(this.state.swipeUpVal, 2).interpolate({
                    inputRange: [-80, 0],
                    outputRange: [0.7, 1],
                    extrapolate: 'clamp'
                  })
                },
                {
                  translateY: Animated.divide(this.state.swipeUpVal, 2).interpolate({
                    inputRange: [-80, 0],
                    outputRange: [-60, 0],
                    extrapolate: 'clamp'
                  })
                }
              ]
            }}
            mediaType={this.props.mediaType}
            repeatVideo
            onExitPressed={this.onExitPressed}
            onTextPress={this.onCommentInputFocus}
            onDonePress={this.onDonePress}
            hideExit={commentInputFocused}
            onNextPress={this.onSendPressed}
            isPopupVisible={selectBusinessModalVisible}
          >
            <KeyboardAvoidingView style={overlayStyles} behavior="padding">
              <TouchableWithoutFeedback onPress={this.blurCommentInput}>
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                  {this.renderFilterSelect()}
                  {commentInputFocused && <View>{this.renderColorSelection()}</View>}
                  {commentInputFocused && this.renderSlider()}
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </FilterViewer>
          {this.renderInputs()}
          {this.renderTopControls()}
          {this.renderControls()}
        </GestureRecognizer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  commentInputContainer: {
    flex: 1
  },
  commentTouchableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    backgroundColor: '#0E0D0D',
    flex: 1
  },
  filterSelectContainer: {
    backgroundColor: '#1E1E1E',
    position: 'absolute',
    bottom: -130,
    width: '100%'
  },
  info: {
    color: 'white'
  },
  inputsContainer: {
    width: 300,
    alignItems: 'center',
    // flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignSelf: 'center',
    position: 'absolute',
    top: '35%',
    justifyContent: 'center'
  },
  overlay: {
    flex: 1
  },
  overlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  colorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20
  },
  color: {
    width: 24,
    height: 24,
    backgroundColor: '#000000',
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 12
  },
  sliderContainer: {
    position: 'absolute',
    top: 105,
    left: 25,
    flexDirection: 'row'
  },
  trackImage: {
    height: 246.6,
    width: 15
  },
  slider: {
    marginLeft: -131,
    marginTop: 102,
    width: 250,
    transform: [{ rotateZ: '-90deg' }]
  },
  inputText: {
    width: 221,
    height: 39,
    opacity: 0.6,
    borderRadius: 50,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center'
  },
  reviewText: {
    fontSize: 17,
    color: '#ffffff'
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  searchBusinessContent: {
    height: '80%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: 'white'
  },
  recommendBusinessContent: {
    height: 465,
    borderRadius: 13,
    backgroundColor: 'white'
  },
  btnTitle: {
    fontSize: 20,
    textAlign: 'center'
  },
  controlOption: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    textShadowColor: '#4f5051',
    textShadowRadius: 1.5,
    textShadowOffset: {
      width: 0.2,
      height: 0.2
    }
  },
  buttonRow: {
    position: 'absolute',
    top: 35,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  buttonRowLeft: {
    left: 0
  },
  buttonRowRight: {
    right: 0
  },
  topButtonRowContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
  topButtonRow: {
    paddingTop: 50,
    paddingRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconImage: {
    height: 24,
    width: 24
  },
  downloadIcon: {
    height: 48,
    width: 48
  },
  text: {
    fontSize: 20,
    color: '#ffffff',
    marginLeft: 15,
    fontWeight: 'bold'
  },
  bottomButtonRow: {
    paddingBottom: 35,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  },
  nextBtn: {
    width: 89,
    height: 32,
    borderRadius: 16.5,
    backgroundColor: '#ff3366',
    shadowColor: 'rgba(88, 88, 88, 0.5)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 11,
    shadowOpacity: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  next: {
    color: 'white'
  },
  filtersContainer: {
    height: 200,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  },
  brightnessContainer: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 19
  }
});

const mapStateToProps = state => {
  const { filterName, uri, mediaType, business, text: previousReviewText } = state.moment;
  const { firstName, lastName } = state.user;
  const { error, reviewUploadLoading } = state.ui;
  const { connectionType } = state.appState;

  return {
    connectionType,
    filterName,
    uri,
    mediaType,
    business,
    firstName,
    lastName,
    error,
    reviewUploadLoading,
    previousReviewText
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onExitTapped: () => dispatch(momentFilterCleared()),
    onLoadPlaceDetails: (placeId) => dispatch(loadPlaceDetails(placeId)),
    onSelectBusiness: business => dispatch(selectReviewBusiness(business)),
    onSelectFilter: filterName => dispatch(momentFilterSelected(filterName)),
    onReviewBusiness: (recommendation, mediaStorageURI) =>
      dispatch(createReview(recommendation, mediaStorageURI)),
    onAddReviewText: (text, textStyles) => dispatch(addReviewBusinessText(text, textStyles)),
    onFilteredMediaSaved: uri => dispatch(filteredMomentPathSet(uri))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MediaEditor);
