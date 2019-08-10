import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { requireNativeComponent, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import SafeAreaView from 'react-native-safe-area-view';
import IonIcon from 'react-native-vector-icons/Ionicons';
import * as mediaService from '../../services/media/media.service';
import ImageViewer from './image-viewer.component';
import VideoPlayer from './video-player.component';
import { ifIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper';

/*
  Media Viewers Presentation Heirarchy

									media-scroller
												|
												|
												v
    media-editor  media-decorator            HIGH LEVEL
            \        /                          |
             \      /                           |
           media-viewer                         |
              /    \                            v
             /      \
    image-viewer  video-player              LOW LEVEL
*/
/**
 * Use this component when displaying images or video
 * This component MUST have a `mediaType` prop which
 * can either be [imageFormat] or [videoFormat]. (e.g. jpg or mp4)
 * and a `uri` of the resource to be displayed
 */

class MediaViewer extends Component {
  renderImageViewer = () => {
    const { filterName, mediaStyle, uri } = this.props;
    return (
      <ImageViewer filterName={filterName} imageURI={uri} style={[styles.fullScreen, mediaStyle]} />
    );
  };

  renderVideoPlayer = () => {
    return (
      <VideoPlayer
        repeat={this.props.repeatVideo}
        videoURI={this.props.uri}
        style={styles.fullScreen}
        onDuration={this.props.onDuration}
        onEnd={this.props.onVideoEnd}
        paused={this.props.videoPaused}
      />
    );
  };

  renderExitButton = () => {
    return (
      <TouchableOpacity style={styles.closeIcon} onPress={this.onExitPressed}>
        <IonIcon style={styles.controlOption} name="ios-close" size={41} color="white" />
      </TouchableOpacity>
    );
  };

  onExitPressed = () => {
    this.props.onExitPressed();
    Actions.pop();
  };

  render() {
    const { children, mediaType, rightExitButton } = this.props;
    const isImage = mediaService.isImage(mediaType);

    const buttonSideStyle = rightExitButton ? styles.buttonRowRight : styles.buttonRowLeft;

    return (
      <View style={styles.fullScreen}>
        <StatusBar hidden={!this.props.hideExit} />

        {isImage ? this.renderImageViewer() : this.renderVideoPlayer()}

        {children}
        <View style={[styles.buttonRow, buttonSideStyle]}>
          {!this.props.hideExit && this.renderExitButton()}
        </View>
      </View>
    );
  }
}

MediaViewer.defaultProps = {
  onVideoEnd: () => {},
  onDuration: () => {},
  onExitPressed: () => {},
  repeatVideo: false,
  videoPaused: false,
  rightExitButton: false
};

MediaViewer.propTypes = {
  filterName: PropTypes.string,
  mediaType: PropTypes.string.isRequired,
  uri: PropTypes.string.isRequired,
  onVideoEnd: PropTypes.func,
  onDuration: PropTypes.func,
  onExitPressed: PropTypes.func,
  repeatVideo: PropTypes.bool,
  videoPaused: PropTypes.bool,
  hideExit: PropTypes.bool,
  rightExitButton: PropTypes.bool
};

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  controlOption: {
    backgroundColor: 'transparent'
  },
  buttonRow: {
    position: 'absolute',
    ...ifIphoneX({
      top: getStatusBarHeight(true) + 10
    }, {
      top: 10
    })
  },
  buttonRowLeft: {
    left: 0
  },
  buttonRowRight: {
    right: 0
  },
  closeIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    marginTop: 8
  }
});

const FilterComponent = requireNativeComponent('FilterComponent');
export default MediaViewer;
