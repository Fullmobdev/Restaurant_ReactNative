import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import ImgIcons from '../img-icons/img-icons';

import { fetchAggregatesForUser } from '../../services/user/user.service';
import { fetchFollowAggregates } from '../../services/follow-status/follow-status.service';
import { loadUserAggregates, loadUser } from '../../actions/users/users.action';
import LoadingPlaceholder from '../loading-placeholder/loading-placeholder.component';
import LoadingPlaceholderStyles from '../../styles/loading-placeholder.styles';

class UserItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentCoords: null,
      showTopLoadingIndicator: false,
      numFollowers: 0,
      numFollowing: 0
    };
  }

  componentDidMount() {
    const { userId } = this.props.user;

    fetchFollowAggregates(userId).then(res => {
      const numFollowers = (res) ? res.numFollowers : 0;
      const numFollowing = (res) ? res.numFollowing : 0;

      this.setState({ numFollowers, numFollowing });
    });

    this.loadUser();
    this.props.onLoadUserAggregates(userId);
  }

  loadUser = () => {
    const { user, userLoaded, onLoadUser } = this.props;
    const { userId } = user;
    
    if (!userLoaded) {
      onLoadUser(userId);
    }
  }

  renderFollowButton = () => {
    const { 
      following, 
      follow, 
      unFollow,
      user 
    } = this.props;
    const { userId } = user;

    return following ? (
      <TouchableOpacity onPress={() => unFollow(userId, this.props.user)}>
        <Icon color="#67b209" name="ios-checkmark-circle" size={35} />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={() => follow(userId, this.props.user)}>
        <Icon name="ios-add-circle-outline" size={35} />
      </TouchableOpacity>
    );
  }

  render() {
    const { userId, photoUrl } = this.props.user;
    const title = `${this.props.user.firstName} ${this.props.user.lastName}`;
    const { onPress, sumReviews, uid } = this.props;
    const isUser = userId === uid;

    return (
      <View style={styles.profileRow}>
        <LoadingPlaceholder
          style={LoadingPlaceholderStyles.mediumCircle}
          loading={!this.props.userLoaded}
        >
          <Image
            resizeMode="cover"
            source={photoUrl ? { uri: photoUrl } : ImgIcons.defaultUser}
            style={styles.userImageStyleSmall}
          />
        </LoadingPlaceholder>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => onPress(userId)}>
            <LoadingPlaceholder
              style={LoadingPlaceholderStyles.longText}
              loading={!this.props.userLoaded}
            >
              <Text style={styles.userName}>{title}</Text>
            </LoadingPlaceholder>
            <LoadingPlaceholder
              style={LoadingPlaceholderStyles.smallText}
              loading={!this.props.userLoaded}
            >
              <Text style={styles.lightText}>{sumReviews} Reviews</Text>
            </LoadingPlaceholder>
            <LoadingPlaceholder
              style={LoadingPlaceholderStyles.smallText}
              loading={!this.props.userLoaded}
            >
              <Text style={styles.lightText}>{this.state.numFollowers} Followers</Text>
            </LoadingPlaceholder>
          </TouchableOpacity>
          { !isUser && 
            <LoadingPlaceholder
              style={LoadingPlaceholderStyles.smallCircle}
              loading={!this.props.userLoaded}
            >
              { this.renderFollowButton() }
            </LoadingPlaceholder> 
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  profileRow: {
    marginTop: 20,
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  userImageStyleSmall: {
    width: 58,
    height: 56,
    borderRadius: 28
  },
  userName: {
    fontSize: 15,
    marginBottom: 5
  },
  lightText: {
    fontSize: 13,
    color: '#aaaaaa'
  }
});

const mapStateToProps = (state, ownProps) => {
  const { user: stateUser, users } = state;
  const { uid } = stateUser;
  const { item } = ownProps;
  let { following } = ownProps;

  if (following == null) {
    following = followingUser(state.user, item);
  }
  
  const user = {
    ...item,
    ...(users.byId[item.userId] || {}),
    ...(item.userId === uid ? stateUser : {})
  };
  
  const { aggregates } = user;
  const { sumRecommends, sumReviews } = aggregates || {};

  const userLoaded = !!user.firstName;

  return {
    uid: state.user.uid,
    user,
    userLoaded,
    following,
    sumRecommends: sumRecommends || 0,
    sumReviews: sumReviews || 0
  };
};

const followingUser = (currentUser, potentialFollowingUser) => {
  const { following, uid } = currentUser;
  if (following && following[uid]) {
    const { userId } = potentialFollowingUser;
    const followingStatusObj = following[uid][userId]
    return followingStatusObj && followingStatusObj.status;
  }

  return false;
}

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadUser: (userId) => { dispatch(loadUser({ userId })); },
    onLoadUserAggregates: (userId) => { dispatch(loadUserAggregates(userId)); }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserItem);
