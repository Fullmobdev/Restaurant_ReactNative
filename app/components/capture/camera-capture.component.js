import React from 'react';
import { Alert, AppState, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'react-native-blur';
import Camera, { constants } from 'react-native-camera';
import Permissions from 'react-native-permissions';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { mediaCaptured } from '../../actions/media.action';
import { momentSelected } from '../../actions/moment.action';
import { TabsIndexToName } from '../../router/tabs.constant';
import { MOMENTS_LIST } from '../../services/moments/moments.constants';
import CameraButton from '../camera-button.component';
import { hasConnection } from '../../../app/types/app-state.types';
import * as SceneType from '../../types/scene.types';


//TODO: Device auth status - https://github.com/lwansbrough/react-native-camera#ios-cameracheckdeviceauthorizationstatus-promise

const MomentTab = props => {
  const { moment, selected, onPress } = props;
  // const momentStyle = styles.momentText;
  let momentStyle = styles.moment;
  let momentTextStyle = styles.momentText;
  if (selected) {
    momentStyle = [styles.moment, styles.selectedMoment];
    momentTextStyle = [styles.momentText, styles.selectedMomentText];
  }

  return (
    <TouchableOpacity onPress={() => onPress(moment)} style={momentStyle}>
      <Text style={momentTextStyle}>{moment}</Text>
    </TouchableOpacity>
  );
};
class Capture extends React.Component {
  constructor(props) {
    super(props);

    this.camera = null;

    this.state = {
      camera: {
        aspect: constants.Aspect.fill,
        captureTarget: constants.CaptureTarget.disk,
        attemptSwitch: false,
        type: constants.Type.back,
        orientation: constants.Orientation.auto,
        flashMode: constants.FlashMode.off,
        torchMode: constants.TorchMode.auto
      },
      isRecording: false,
      photoPermission: null,
      microphonePermission: null,
      selectedMoment: 'Food',
      currentAppState: AppState.currentState,
      isCloseCamera: false
    };
    this.moments = MOMENTS_LIST;
  }

  componentDidMount() {
    this.requestPermissions()
    .finally(() => {
      this.handleAlerts();
    });

    AppState.addEventListener('change', this.handleAppStateChange);
    this.props.momentSelected(this.state.selectedMoment);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.camera = null;
  }

  componentWillReceiveProps(nextProps) {
    const { previousTabScene, currentScene } = nextProps;
    if (currentScene === 'capture_tab' && previousTabScene !== currentScene) {
      this.handleAlerts();
      this.showPreviousReviewStillUploadingAlert();
    }

    setTimeout(() => {
      if (this.props.currentScene === 'capture_tab') {
        this.setState({ hide: false });
      } else {
        this.camera = null;
      }
    }, 100);
  }

  handleAlerts = () => {
    const { userLocationSupported } = this.props;
    
    if (!userLocationSupported) {
      Alert.alert('Woah slow down there!',
      'Views is not yet in your location. Now we know you want us there. Coming soon!');
    }
  }

  showPreviousReviewStillUploadingAlert = () => {
    const { reviewUploadLoading } = this.props;
    if (reviewUploadLoading) {
      Alert.alert('Review upload in progress',
      'Your previous review is still uploading. Give it a moment.',
      [
        { text: 'OK', onPress: () => { Actions.popTo(SceneType.TIMELINE_TAB); } },
      ],
    );
    }
  }

  /**
   * Permissions
   */
  //TODO: Put permissions in own service?

  showCameraUnauthorizedAlert = () => {
    const button = [];
    if (Permissions.canOpenSettings()) {
      button.push({ text: 'Open Settings', onPress: this.openSettings });
    } else {
      button.push({ text: 'OK', style: 'cancel' });
    }
    Alert.alert('Oops!', 'Views is a camera app. Please allow access to the camera', button);
  };

  //update permissions when app comes back from settings
  handleAppStateChange = appState => {
    this.setState({ currentAppState: appState });
    if (appState === 'active') {
      this.checkCameraPermissions().then(() => {
        if (this.state.photoPermission !== 'authorized') {
          this.showCameraUnauthorizedAlert();
        }
      });
    }
  };

  requestPermissions = () => {
    return this.requestCameraPermission().then(response => {
      if (response === 'authorized') {
        return this.requestMicrophonePermission();
      }
    });
  };

  //Requesting access
  requestCameraPermission = () => {
    return Permissions.request('camera').then(response => {
      this.setState({ photoPermission: response });
      return response;
    });
  };

  requestMicrophonePermission = () => {
    return Permissions.request('microphone').then(response => {
      //returns once the user has chosen to 'allow' or to 'not allow' access
      //response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({ microphonePermission: response });
    });
  };

  openSettings = () => {
    return Permissions.openSettings().then(() => {});
  };

  checkCameraPermissions = () => {
    return Permissions.checkMultiple(['camera', 'microphone']).then(response => {
      this.setState({
        cameraPermission: response.camera,
        microphonePermission: response.microphone
      });
      return response;
      //response.x is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
    });
  };

  /**
   * Navigation
   */
  navigateToNextScene = () => {
    //Reset the camera button's animated state
    this.refs.cameraButton.resetState();
    const { nextScene } = this.props;
    Actions[nextScene]({ onBackPressed: this.backPressed });
  };

  backPressed = () => {
    this.camera && this.camera.startPreview();
  }

  takePicture = () => {
    const { isAnonymous, registrationRedirectScene } = this.props;
    if (isAnonymous) {
      Actions[registrationRedirectScene]();
      return;
    }

    if (this.camera && this.state.isRecording === false) {
      this.camera
        .capture()
        .then(data => {
          setTimeout(() => {
            this.camera && this.camera.stopPreview();
            this.props.mediaCaptured({ mediaType: 'png', uri: data.path });
            this.navigateToNextScene();
          }, 100);
        })
        .catch(err => {});
    }
  };

  startRecording = () => {
    const { isAnonymous, registrationRedirectScene } = this.props;
    if (isAnonymous) {
      Actions[registrationRedirectScene]();
      return;
    }

    if (this.camera && this.state.isRecording === false) {
      const { back, front } = constants.Type;
      const { type } = this.state.camera;
      const flashModeIsEnabled = this.state.camera.flashMode === constants.FlashMode.on;

      this.setState({
        isRecording: true,
        camera: {
          ...this.state.camera,
          torchMode: flashModeIsEnabled ? constants.TorchMode.on : constants.TorchMode.off
        }
      });

      const { attemptSwitch } = this.state.camera;

      while (this.state.isRecording === true) {
        if (type === back && attemptSwitch) {
          this.setState({ type: front });
        } else if (type === front && attemptSwitch) {
          this.setState({ type: back });
        } else {
          break;
        }
      }

      let path;
      this.camera
        .capture({
          mode: constants.CaptureMode.video,
          audio: true,
          path
        })
        .then(data => {
          this.camera && this.camera.stopPreview();
          this.props.mediaCaptured({ mediaType: 'mp4', uri: data.path });
          this.navigateToNextScene();
          this.setState({
            isRecording: false
          });
        })
        .catch(err => {});
    }
  };

  stopRecording = () => {
    if (this.camera && this.state.isRecording === true) {
      this.camera && this.camera.stopCapture();
      this.setState({
        isRecording: false,
        camera: {
          ...this.state.camera,
          torchMode: constants.TorchMode.off
        }
      });
    }
  };

  /**
   * Switch whether to use front or back camera
   */
  switchType = () => {
    let newType;
    const { back, front } = constants.Type;
    const { attemptSwitch } = this.state.camera;

    this.setState({ attemptSwitch: true });

    if (this.state.camera.type === back) {
      newType = front;
    } else if (this.state.camera.type === front) {
      newType = back;
    }

    this.setState({
      camera: {
        ...this.state.camera,
        type: newType
      }
    });
  };

  /**
   * Front/back icon image
   */
  get typeIcon() {
    let icon;
    const { back, front } = constants.Type;

    if (this.state.camera.type === back) {
      icon = require('../../images/btnSwitchCamera.png');
    } else if (this.state.camera.type === front) {
      icon = require('../../images/btnSwitchCamera.png');
    }

    return icon;
  }

  /**
   * Switch flash mode to on or off
   */
  switchFlash = () => {
    const { on, off } = constants.FlashMode;
    this.setState({
      camera: {
        ...this.state.camera,
        flashMode: this.state.camera.flashMode === on ? off : on
        // torchMode: this.state.camera.torchMode,
      }
    });
  };

  get flashIcon() {
    let icon;
    const { on } = constants.FlashMode;

    if (this.state.camera.flashMode === on) {
      icon = require('../../images/capture/ic_flash_on_white.png');
    } else {
      icon = require('../../images/capture/ic_flash_off_white.png');
    }
    return icon;
  }

  navigateToPreviousScene = () => {
    this.camera && this.camera.stopPreview();
    this.setState({
      hide:true
    });
    setTimeout(() => {
      Actions.popTo(this.props.previousTabScene);
    }, 200);

    //this.props.navigation.goBack();
    //this.camera.stopPreview();
    //this.props.componentWillUnmount();
    //Actions.pop();
    //Actions.popTo(this.props.previousTabScene);
    //ReactDOM.unmountComponentAtNode("camera-capture");// unmountComponentAtNode(document.getElementById('root'));
  };

  onMomentSelection = selectedOptionIndex => {
    const moment = this.moments[selectedOptionIndex];
    this.props.momentSelected(moment);
  };

  selectMoment = term => {
    this.setState(
      {
        selectedMoment: term
      },
      () => {
        this.props.momentSelected(term);
      }
    );
  };

  /**
   * Render methods
   */

  renderTypeButton = () => {
    return (
      <TouchableOpacity style={styles.typeButton} onPress={this.switchType}>
        <Image source={this.typeIcon} />
      </TouchableOpacity>
    );
  };

  renderCameraButton = () => {
    const { attemptSwitch } = this.state.camera;
    const { 
      isAnonymous, 
      userLocationSupported, 
      reviewUploadLoading 
    } = this.props;
    return (
      <CameraButton
        ref="cameraButton"
        disabled={!userLocationSupported || reviewUploadLoading}
        functionalityDisabled={isAnonymous}
        style={styles.captureButton}
        buttonWasTapped={this.takePicture}
        buttonDidBeginLongPress={this.startRecording}
        buttonDidEndLongPress={this.stopRecording}
        buttonSize={50}
        progressLineWidth={3}
      />
    );
  };

  renderFlashButton = () => {
    return (
      <TouchableOpacity style={styles.flashButton} onPress={this.switchFlash}>
        <Image source={this.flashIcon} />
      </TouchableOpacity>
    );
  };

  renderHomeButton = () => {
    return (
      <View style={[styles.topButtonRow, styles.topButtonRowContainer]}>
        {this.renderFlashButton()}
        <TouchableOpacity onPress={this.navigateToPreviousScene}>
          <Icon style={styles.controlOption} name="ios-close" size={35} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  renderCamera = () => {
    const shouldRenderCamera = this.state.photoPermission === "authorized"
    && this.props.currentScene === 'capture_tab' && (this.state.currentAppState !== "background");
      if (shouldRenderCamera) {
        if (!this.state.hide) {
        return this.state.photoPermission === 'authorized' ? (
        <Camera
          ref={cam => {
            this.camera = cam;
          }}
          style={styles.preview}
          aspect={this.state.camera.aspect}
          captureTarget={this.state.camera.captureTarget}
          type={this.state.camera.type}
          flashMode={this.state.camera.flashMode}
          torchMode={this.state.camera.torchMode}
          onFocusChanged={() => {}}
          onZoomChanged={() => {}}
          defaultTouchToFocus
          mirrorImage={false}
          keepAwake={false}
          orientation={this.state.camera.orientation}
        />
      ) : (
        <View style={[styles.preview, { backgroundColor: 'black' }]} />
      );
      } else {
        <View style={[styles.preview, { backgroundColor: 'black' }]} />
      }
  }else {
    return <View style={[styles.preview, { backgroundColor: 'black' }]} />;
  }
  };

  render() {
    if (this.props.currentScene === 'capture_tab') {

      return (
        <View style={styles.container}>
          <StatusBar animated barStyle="light-content" />
          {this.renderCamera()}

          {this.renderHomeButton()}
          {/* <SelectSlider options={this.moments} onSelection={this.onMomentSelection} /> */}
          <BlurView blurAmount={10} blurType="dark" style={styles.momentsContainer}>
            <MomentTab
              moment="Food"
              selected={this.state.selectedMoment === 'Food'}
              onPress={this.selectMoment}
            />
            <MomentTab
              moment="Customer Service"
              selected={this.state.selectedMoment === 'Customer Service'}
              onPress={this.selectMoment}
            />
            <MomentTab
              moment="Ambiance"
              selected={this.state.selectedMoment === 'Ambiance'}
              onPress={this.selectMoment}
            />
          </BlurView>
          <BlurView blurAmount={20} blurType="dark" style={[styles.overlay]}>
            <View style={styles.cameraControls}>
              {this.renderFlashButton()}
              {this.renderCameraButton()}
              {this.renderTypeButton()}
            </View>
          </BlurView>
        </View>
      );
    } else {
      return null;
    }
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  topButtonRowContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0
  },
  topButtonRow: {
    paddingLeft: 20,
    paddingTop: 50,
    paddingRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  controlOption: {
    backgroundColor: 'transparent',
    width: 40,
    paddingLeft: 6,
    marginTop: 10
  },

  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 130,
    justifyContent: 'flex-start'
    // backgroundColor: 'black',
  },
  cameraControls: {
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  captureButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.0)',
    borderRadius: 40
    // backgroundColor: 'red'
  },
  typeButton: {},
  flashButton: {},
  buttonsSpace: {
    width: 10
  },
  momentsContainer: {
    width: 326,
    height: 35,
    borderRadius: 16.5,
    // backgroundColor: 'red',
    // shadowColor: 'rgba(88, 88, 88, 0.5)',
    // shadowOffset: {
    //   width: 0,
    //   height: 2
    // },
    // shadowRadius: 11,
    // shadowOpacity: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 150,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10
  },
  moment: {
    borderRadius: 16,
    backgroundColor: 'transparent',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7
  },
  selectedMoment: {
    backgroundColor: '#ff3366'
  },
  momentText: {
    fontSize: 13,
    color: '#ffffff'
  },
  selectedMomentText: {
    fontWeight: 'bold'
  }
});

const mapStateToProps = state => {
  const { appState, ui, user } = state;
  const { previousTabIndex, selectedTabIndex, reviewUploadLoading } = ui;
  const { address, isAnonymous } = user;
  const { connectionType } = appState;

  let userLocationSupported = true;
  if (hasConnection(connectionType)
      && address.state
      && address.state.toLowerCase() !== 'new york') {
    userLocationSupported = false;
  }

  return {
    isAnonymous,
    userLocationSupported,
    reviewUploadLoading,
    previousTabScene: TabsIndexToName[previousTabIndex],
    currentScene: TabsIndexToName[selectedTabIndex]
  };
};

const mapDispatchToProps = dispatch => {
  return {
    mediaCaptured: ({ uri, mediaType }) => dispatch(mediaCaptured({ uri, mediaType })),
    momentSelected: moment => dispatch(momentSelected(moment))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Capture);
