import React, { Component, PropTypes } from 'react';
import { View } from 'react-native';
import Video from 'react-native-video';

class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // rate: 1,
      volume: 1,
      muted: false,
      resizeMode: 'stretch',
      duration: 0.0,
      currentTime: 0.0,
      controls: false,
      skin: 'custom',
      ignoreSilentSwitch: "ignore",
      isBuffering: false,
    };
  }

  onLoad = (data) => {
    this.setState({ duration: data.duration });
    this.props.onDuration(data.duration * 1000);
  }

  onProgress = (data) => {
    this.setState({ currentTime: data.currentTime });
  }

  onBuffer = ({ isBuffering }) => {
    this.setState({ isBuffering });
  }

  renderVideoPlayer = () => {
    return (
      <Video
        ref={(ref) => {
          this.player = ref;
        }}
        source={{ uri: this.props.videoURI }}
        style={this.props.style}
        /* rate={this.state.rate} */
        paused={this.props.paused}
        volume={this.state.volume}
        muted={this.state.muted}
        ignoreSilentSwitch={this.state.ignoreSilentSwitch}
        resizeMode={this.state.resizeMode}
        onLoad={this.onLoad}
        onBuffer={this.onBuffer}
        onProgress={this.onProgress}
        onEnd={this.props.onEnd}
        repeat={this.props.repeat}
      />
    );
  }

  render() {
    return (
        <View style={this.props.style}>
          {this.renderVideoPlayer()}
        </View>
    );
  }
}

VideoPlayer.propTypes = {
  onDuration: PropTypes.func,
  onEnd: PropTypes.func,
  repeat: PropTypes.bool,
  paused: PropTypes.bool,
};

VideoPlayer.defaultProps = {
  onEnd: () => {},
  repeat: false,
  paused: false,
};

export default VideoPlayer;
