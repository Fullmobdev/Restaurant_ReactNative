import PropTypes from 'prop-types';
import moment from 'moment';
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getBottomSpace, ifIphoneX } from 'react-native-iphone-x-helper';
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';
import SafeAreaView from 'react-native-safe-area-view';
import { connect } from 'react-redux';
import { fetchBusinessDetail, fetchBusinessRecommendationsByPlaceId, businessSelected } from '../../actions/business.action';
import { selectUser } from '../../actions/users/users.action';
import UserThumbnail from '../../components/user-thumbnail/user-thumbnail.component';
import ViewsIcon from '../../fonts/icon-font';
import * as locationService from '../../services/location/location.service';
import * as search from '../../services/search/search.library';
import Colors from '../../styles/colors.styles';
import { Typography } from '../../styles/typography.styles';
import * as SceneType from '../../types/scene.types';
import { formatReviewStats } from '../helpers/review-stats-helpers';
import LikeButton from '../like-button/like-button.component';
import ShareButton from '../share-button/share-button.component';
import { withUser } from '../with-user/with-user.component';
import LikesViewsCount from '../likes-views-count/likes-views-count.component';

class ReviewDetails extends Component {
  clearAnimationTimeout = null;
  constructor(props) {
    super(props);
    this.state = {
      currentCoords: null,
      businessDetails: {}
    };
  }
  componentDidMount() {
    locationService.getCurrentLocation().then(loc => {
      this.setState({ currentCoords: loc });
    });
    const { businessId, businessCategory } = this.props.review;
    this.props.fetchBusinessDetail(businessId, businessCategory);
  }

  handleUserPress = userId => {
    Actions.pop();
    this.props.selectUser(userId);
    setTimeout(() => {
      Actions[SceneType.PROFILE_TAB]();
    }, 0);
  };

  handleBusinessPress = () => {
    Actions.pop();
    const { businessId, businessCategory } = this.props.review;
    this.props.businessSelected(businessId, businessCategory);
    setTimeout(() => {
      Actions[SceneType.TIMELINE_BUSINESS]();
    }, 0);
  };


  onAnimationRun = () => {
    // this.setState({ runAnimation: false });
  };

  render() {
    const { 
      likeButtonPressed, 
      recommended, 
      review, 
      onShareButtonPressed, 
      profilePicUrl,
      showViewsLikesUsersDisabled,
      showViewLikesUsers,
      viewsLikesUserIds
    } = this.props;

    const {
      businessName,
      createdTime,
      userName,
      businessLocation,
      userId,
      likeStatus,
      numViews,
      numLikes
    } = review;

    if (!this.state.currentCoords) {
      return null;
    }
    const distanceInMiles =
      locationService.distFromLocation(businessLocation, this.state.currentCoords) || '';

    const distanceLabel = `${distanceInMiles} mi`;
    const timeAgoText = moment(createdTime).fromNow();

    return (
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.userDetailsContainer}>
          <View style={[styles.row, { marginTop: 20 }]}>
            <TouchableOpacity onPress={() => this.handleBusinessPress(review)}>
              <Text style={styles.businessName}>{businessName}</Text>
            </TouchableOpacity>
            { recommended &&
              <View style={styles.recommendedBackground}>
                <ViewsIcon name='recommend' style={styles.recommended} />
              </View>
            }
          </View>

          <View style={styles.row}>
            <UserThumbnail onPress={() => this.handleUserPress(userId)} profilePicUrl={profilePicUrl} />
            <TouchableOpacity onPress={() => this.handleUserPress(userId)}>
              <Text
                style={styles.userName}
              >
                {userName}
              </Text>
            </TouchableOpacity>
            <Text style={styles.middleDot}>&#183;</Text>
            <Text style={styles.createdTime}>{ timeAgoText }</Text>
          </View>

          <View style={styles.footer}>
            <LikesViewsCount
              disabled={showViewsLikesUsersDisabled}
              numLikes={numLikes}
              numViews={numViews}
              onPress={showViewLikesUsers}
              showUsers={!showViewsLikesUsersDisabled}
              userIds={viewsLikesUserIds}
            />
            <View style={[styles.row, styles.buttonRow]}>
              <LikeButton
                onPress={likeButtonPressed}
                selected={likeStatus}
              />
              <ShareButton onPress={onShareButtonPressed} />
            </View>
          </View>
          </SafeAreaView>
        </LinearGradient>
    );
  }
}

ReviewDetails.propTypes = {
  showViewLikesUsers: PropTypes.func,
  showViewsLikesUsersDisabled: PropTypes.bool,
  viewsLikesUserIds: PropTypes.arrayOf(PropTypes.string)
};

ReviewDetails.defaultProps = {
  showViewLikesUsers: () => {},
  showViewsLikesUsersDisabled: true,
  viewsLikesUserIds: []
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 20
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.ViewsGray2,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  userDetailsContainer: {
    height: '100%',
    paddingLeft: 20,
    paddingRight: 20,
    position: 'absolute',
    width: '100%'
  },
  businessName: {
    ...Typography.title3,
    color: Colors.ViewsWhite,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 10
  },
  buttonRow: {
    ...ifIphoneX({
      marginBottom: getBottomSpace()
    },{
      marginBottom: 20
    })
  },
  imageStyle: {
    height: 56,
    width: 58,
    borderRadius: 29
  },
  recommendedBackground: {
    backgroundColor: Colors.ViewsRed,
    paddingHorizontal: 5,
    paddingTop: 3,
    paddingBottom: 7,
    borderRadius: 10,
    marginLeft: 10,
    position: 'relative',
    bottom: 3
  },
  recommended: {
    color: Colors.ViewsWhite,
    fontSize: 9
  },
  reviewStatsContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    position: 'relative',
  },
  mediaIndicator: {
    borderRadius: 50,
    flexDirection: 'row'
  },
  userInfoContainer: {
    marginLeft: 20
  },
  userName: {
    ...Typography.bodySmall,
    color: Colors.ViewsWhite,
    fontWeight: '700',
    marginLeft: 10
  },
  createdTime: {
    ...Typography.bodySmall,
    color: Colors.ViewsGray2
  },
  middleDot: {
    fontSize: 24,
    color: Colors.ViewsGray2,
    marginHorizontal: 5
  },
  neighbourHood: {
    color: '#ccc'
  },
  locationContainer: {
    marginTop: 3
  },
  otherInfoContainer: {
    height: '100%',
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  distanceStyle: {
    fontFamily: 'Avenir',
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: 0.3,
    marginTop: 5,
    marginRight: 2
  },
  iconStyle: {
    color: Colors.ViewsRed,
    marginRight: 5
  },
  timeStyle: {
    color: '#fff',
    marginTop: 5
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

const mapStateToProps = state => {
  const { businesses } = state;
  return { businesses };
};

const mapDispatchToProps = dispatch => {
  return {
    selectUser: userId => {
      dispatch(selectUser({ userId }));
    },
    businessSelected: (businessId, businessCategory) => {
      dispatch(businessSelected(businessId, businessCategory));
    },
    onLoadRecommendation: placeId => {
      dispatch(fetchBusinessRecommendationsByPlaceId(placeId));
    },
    fetchBusinessDetail: (businessId, businessCategory) =>
      dispatch(fetchBusinessDetail(businessId, businessCategory))
  };
};

// : '8Z8sZWejAkXs2hTyeEkuTvauL0b2'

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewDetails);
