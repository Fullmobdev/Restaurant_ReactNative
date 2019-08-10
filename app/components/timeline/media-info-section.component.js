import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import ViewsIcon from '../../fonts/icon-font';
import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import Colors from '../../styles/colors.styles';
import { Typography } from '../../styles/typography.styles';
import { formatReviewStats } from '../helpers/review-stats-helpers';
import { getNeighborhoodFromLocation } from '../../services/location/location.service';
import PressIn from '../press-in/press-in.component';
import UserThumbnailGroup from '../user-thumbnail-group/user-thumbnail-group.component';

class MediaInfoSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
       neighborhood: null
   };
  }

  componentDidMount() {
    if (!this.props.neighborhood) {
      this.props.onLoadBusinessNeighborhood();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.neighborhood) {
      this.props.onLoadBusinessNeighborhood();
    }
  }

  handleSpeakerClick = () => {
    //TODO - needs to be implemented
  };

  handleUserPress = () => {
    const { id, selectUser } = this.props;
    selectUser(id);
  }

  handleBusinessPress = () => {
    const { businessId, selectBusiness } = this.props;
    selectBusiness(businessId);
  }

  renderMediaInfo = () => {
    const {
      businessName,
      distance,
      onPress,
      showIndicator,
      showNewIndicator,
      thumbnail,
      title,
      recommended,
      speakerIcon,
      profilePic
    } = this.props;
    const touchableHighlightUnderlay = 'rgba(224, 224, 224, 0.3)';
    let mediaIndicatorStyle;

    if (showIndicator) {
      mediaIndicatorStyle = showNewIndicator
        ? styles.mediaIndicator : '';
    }

    const neighborhood = this.props.neighborhood || this.state.neighborhood;

    return (
      <View style={styles.touchableHighlight}>
        <View>
          <View style={styles.userDetailsContainer}>
            <View style={mediaIndicatorStyle}>
              <TouchableOpacity onPress={this.handleUserPress}>
                <View style={styles.userProfile}>
                  {this.renderProfilePic()}
                </View>
              </TouchableOpacity>
            </View>
            {/* User and restaurant details */}
            <View style={styles.userInfoContainer}>
              <View style={styles.userInfoRow}>
                <TouchableOpacity onPress={this.handleUserPress}>
                  <Text style={styles.userName}>{title}</Text>
                </TouchableOpacity>

                { distance &&
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ViewsIcon name={'location_pin'} color={Colors.ViewsRed} />
                    <Text style={styles.distance}>{distance}</Text>
                  </View>
                }
              </View>

              <View style={styles.userInfoRow}>
                <View style={styles.businessNameContainer}>
                  <TouchableOpacity onPress={this.handleBusinessPress}>
                    <Text style={styles.businessName} numberOfLines={1} ellipsizeMode={'tail'}>{businessName}</Text>
                  </TouchableOpacity>
                  { recommended && <View style={styles.recommend} ><ViewsIcon name={'recommend'} size={9} color={Colors.ViewsWhite} /></View> }
                </View>
                <View style={styles.locationContainer}>
                  <Text style={styles.neighbourHood} numberOfLines={1} ellipsizeMode={'tail'}>{neighborhood}</Text>
                </View>
              </View>
            </View>
          </View>


          <PressIn 
            style={styles.thumbnailContainer}
            onPress={onPress}
          >
              <ImageBackground 
                style={styles.thumbnailImageContainerStyle}
                imageStyle={styles.thumbnailImageStyle}
                source={thumbnail} 
              />
          </PressIn>
          
          {/* {speakerIcon && (
            <TouchableOpacity onPress={this.handleSpeakerClick} style={styles.speakerIconContainer}>
              <Image style={styles.speakerIcon} source={require('../../images/speaker.png')} />
            </TouchableOpacity>
          )} */}
          {this.renderReviewStats()}
        </View>
      </View>
    );
  };

  renderProfilePic = () => {
    const { profilePic } = this.props;
    if (profilePic === '') {
        return (
          <Icon name='ios-person' size={40} color={Colors.ViewsGray3} style={styles.defaultUser} />
        );
    }
    return (
      <Image source={{ uri: profilePic }} resizeMode="cover" style={styles.imageStyle} />
    );
  }

  renderReviewStats = () => {
    const { 
      numLikes, 
      numViews, 
      likeStatus,
      isUserReview,
      likesUserIds,
      viewsUserIds,
      onLikesCountPress 
    } = this.props;
    const likesText = `${formatReviewStats(numLikes)} likes`;
    const viewsText = `${formatReviewStats(numViews)} views`;

    return (
      <TouchableOpacity 
        style={styles.reviewStatsContainer}
        disabled={!isUserReview}
        onPress={onLikesCountPress}
      >
        { isUserReview && 
          <UserThumbnailGroup
            maxNumThumbnails={3}
            userIds={likesUserIds}
          />
        }
        <Text style={styles.reviewStatsText}>{viewsText}</Text>
        <Text style={styles.dotSeparator}>.</Text>

        <View style={styles.likesContainer}>
          <Text style={styles.reviewStatsText}>{likesText}</Text>
          {likeStatus &&
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.reviewStatsText, { marginHorizontal: 2 }]}>+</Text>
              <Text style={{ ...Typography.bodySmall }}>you</Text>
            </View>}
        </View>
      </TouchableOpacity>
    );
  };

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props;
  }

  render() {
    const style = this.props.firstItem ? [styles.containerStyle, styles.containerStyleFirstItem]
      : [styles.containerStyle];

    return (
      <View style={style} onLayout={this.props.onLayout}>
        {this.renderMediaInfo()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  defaultUser: {
    position: 'relative',
    top: 5
  },
  dotSeparator: {
    marginHorizontal: 3,
    marginBottom: 12,
    fontSize: 24
  },
  imageAndNames: {
    flexDirection: 'row'
  },
  containerStyle: {
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    flex: 1
  },
  containerStyleFirstItem: {
    paddingTop: 10
  },
  imageContainerStyle: {
    paddingLeft: 10,
    paddingRight: 20
  },
  imageStyle: {
    height: 40,
    width: 40,
    borderRadius: 29
  },
  likeButtonContainer: {
    marginRight: 20
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userProfile: {
    backgroundColor: Colors.ViewsWhite,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.ViewsGray1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    height: 30,
    width: 30
  },
  mediaIndicator: {
    borderColor: Colors.ViewsBlue3,
    borderWidth: 2,
    borderRadius: 30,
    padding: 3

  },
  namesContainer: {
    flex: 2,
    marginTop: 5
  },
  infoContainer: {
    flex: 1,
    marginTop: 5,
    paddingRight: 10,
    alignItems: 'flex-end'
  },
  userNameStyle: {
    fontFamily: 'Avenir',
    fontSize: 11,
    fontWeight: '600',
    color: '#76787a',
    letterSpacing: 0.5
  },
  businessNameStyle: {
    fontFamily: 'Avenir',
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
    letterSpacing: 0.1,
    marginTop: 3,
    lineHeight: 17
  },
  distanceContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 7
  },
  distance: {
    ...Typography.bodySmall,
    marginLeft: 5
  },
  iconStyle: {
    color: Colors.ViewsRed,
    // marginTop: 1,
    marginRight: 5
  },
  reviewStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20
  },
  reviewStatsText: {
    ...Typography.bodySmall,
    color: Colors.ViewsGray1
  },
  touchableHighlight: {
    flex: 1
  },

  // NEW STYLES

  userDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15
  },
  userImageContainer: {
    width: 66,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 245, 245, 0)',
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#2962ff'
  },
  userInfoContainer: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center'
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  userName: {
    ...Typography.headline,

  },
  neighbourHood: {
    ...Typography.bodySmall,
    marginLeft: 2,
    color: Colors.ViewsGray1
  },
  businessName: {
    ...Typography.bodySmall,
    paddingRight: 12
  },
  businessNameContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center'
  },
  locationContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 3,
    paddingLeft: 10,
    flex: 1,
    justifyContent: 'flex-end'
  },
  otherInfoContainer: {
    height: '100%',
    flex: 1,
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
    marginTop: 7
  },
  thumbnailContainer: {
    borderRadius: 15,
    height: 375,
    paddingHorizontal: 15,
    marginTop: 10
  },
  thumbnailImageStyle: {
    borderRadius: 15,
  },
  thumbnailImageContainerStyle: {
    flex: 1
  },
  recommendedStyle: {
    position: 'absolute',
    top: 5,
    right: -10
  },
  recommend: {
    position: 'relative',
    right: 10,
    paddingHorizontal: 3,
    paddingTop: 2,
    paddingBottom: 4,
    borderRadius: 10,
    backgroundColor: Colors.ViewsRed
  },
  speakerIconContainer: {
    position: 'absolute',
    bottom: 85,
    right: 0
  },
  speakerIcon: {
    width: 48,
    height: 48
  }
});

MediaInfoSection.propTypes = {
  firstItem: PropTypes.bool,
  id: PropTypes.string.isRequired,
  thumbnail: PropTypes.object.isRequired,
  businessName: PropTypes.string.isRequired,
  percentRecommend: PropTypes.string.isRequired,
  timeCreated: PropTypes.string.isRequired,
  distance: PropTypes.string.isRequired,
  selectUser: PropTypes.func,
  showIndicator: PropTypes.bool,
  showNewIndicator: PropTypes.bool,
  speakerIcon: PropTypes.bool
};

MediaInfoSection.defaultProps = {
  firstItem: false,
  userImage: require('../../images/defaultUser.png'),
  businessName: '',
  percentRecommend: '',
  timeCreated: '',
  title: '',
  distance: '',
  selectUser: () => {},
  showIndicator: false,
  showNewIndicator: false,
  likesUserIds: [],
  viewsUserIds: [],
  isUserReview: false
};

export default MediaInfoSection;
