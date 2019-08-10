import React, { Component } from 'react';
import { Actions } from 'react-native-router-flux';
import { View, StatusBar, Image, ImageBackground, TouchableOpacity } from 'react-native';
import imgIcons from '../img-icons/img-icons';
import MediaScroller from '../media-viewers/media-scroller.component';

class BusinessHeader extends Component {
  state = {
    showReviews: false
  }

  componentDidMount() {
    //USING set time out because reviews are being fetched
    setTimeout(() => {
      // this.props.playReviews();
      this.setState({ showReviews: true });
    }, 1000);
  }

  onExitPressed = () => {
    Actions.pop();
  };

  onSharePress = () => { };

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

  render() {
    const { businessImage } = this.props;
    return (
      <View style={[styles.container]}>
        <StatusBar barStyle="light-content" />
        {this.props.reviews && this.props.reviews.length === 0 ? (
          <View style={{ flex: 1, height: 350 }}>
            {businessImage ? (
              <ImageBackground
                resizeMode="cover" style={styles.imageStyle}
                source={{ uri: businessImage }}
              />
            ) :
            (
              <Image
              style={{ height: 200, width: 200 }}
              source={imgIcons.imageMissing}
              />
            )}
              {this.renderIcons()}
          </View>
        ) : (
          <View style={{ flex: 1, height: 350 }}>
            {this.state.showReviews && this.props.playReviews && (
              <MediaScroller
                beginningIndex={0}
                media={this.props.reviews}
                onFinished={() => {}}
                onPress={() => {}}
                onViewTimerElapsed={() => {}}
                smoothProgressBar
                hideDetails
                loop
                showProgressBar={false}
                onUserProfilePress={() => {}}
              />
            )}
          </View>
        )}
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    height: 350
  },
  imageStyle: {
    flex: 1,
    height: 350
    // alignItems: 'center',
    // justifyContent: 'flex-start'
  },
  icons: {
    width: '100%',
    position: 'absolute',
    top: 40,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
};

export default BusinessHeader;
