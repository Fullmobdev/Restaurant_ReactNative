import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  requireNativeComponent,
  Animated,
  Text,
  Image,
  Slider,
  ImageBackground
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import IonIcon from 'react-native-vector-icons/Ionicons';
import * as mediaService from '../../services/media/media.service';
import VideoPlayer from './video-player.component';
import ImageViewer from './image-viewer.component';
import imgIcons from '../img-icons/img-icons';

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

class FilterViewer extends Component {
  getFilterComponentRef = () => {
    return this.filterComponent;
  };

  renderImageViewer = () => {
    const { filterName, mediaStyle, uri, mediaType, thumbnail, onSave, isPopupVisible } = this.props;
   // if(!isPopupVisible){
    return (
      // <ImageViewer
      // 	filterName={filterName}
      // 	imageURI={uri}
      // 	style={[styles.fullScreen, mediaStyle]}
      // />
      <Animated.View style={[styles.fullScreen, mediaStyle]}>
        <FilterComponent
          mediaType={mediaType}
          style={{ flex: 1 }}
          onSave={onSave}
          filterName={filterName}
          filePath={uri}
          thumbnail={thumbnail}
          ref={component => (this.filterComponent = component)}
        />
      </Animated.View>
    );
   //}
   // else{ return null; }
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
      <TouchableOpacity onPress={this.onExitPressed}>
        <IonIcon style={styles.controlOption} name="ios-arrow-back" size={30} color="white" />
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
      <View style={styles.container}>
        <StatusBar animated barStyle="light-content" />

        {isImage ? this.renderImageViewer() : this.renderImageViewer()}

        {children}
      </View>
    );
  }
}

FilterViewer.defaultProps = {
  mediaStyle: StyleSheet.create({}),
  onVideoEnd: () => {},
  onDuration: () => {},
  onExitPressed: () => {},
  repeatVideo: false,
  videoPaused: false,
  rightExitButton: false
};

FilterViewer.propTypes = {
  filterName: PropTypes.string,
  mediaStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  }
});

const FilterComponent = requireNativeComponent('FilterComponent');
export default FilterViewer;
