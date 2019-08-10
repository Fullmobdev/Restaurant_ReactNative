import moment from 'moment';
// Types
import {
  FOLLOW_USER_REQUEST,
  FOLLOW_USER_SUCCESS,
  FOLLOW_USER_FAILURE,
  LOAD_FOLLOWING_STATUS_REQUEST,
  LOAD_FOLLOWING_STATUS_FAILURE,
  LOAD_FOLLOWING_STATUS_SUCCESS,
  UNFOLLOW_USER_REQUEST,
  UNFOLLOW_USER_SUCCESS,
  UNFOLLOW_USER_FAILURE,
  FETCH_FOLLOWERS_SUCCESS,
  FETCH_FOLLOWING_SUCCESS,
  FETCH_FOLLOWERS_FAILURE,
  FETCH_FOLLOWING_FAILURE,
  FOLLOW_REQUEST_PENDING,
  UNFOLLOW_REQUEST_PENDING
} from '../../types/fetch-status.types';
import {
  addFollower,
  fetchFollowingStatus,
  removeFollower,
  fetchFollowAggregates,
  fetchFollowers,
  fetchFollowing
} from '../../services/follow-status/follow-status.service';

export const followUser = (followedId, followedUser) => {
  return (dispatch, getState) => {
    const { user, users } = getState();
    dispatch(followRequestPending(true));
    if (followedUser) {
      // const { firstName, lastName, photoUrl } = followedUser;
    }
    const { firstName, lastName, photoUrl } = followedUser || users.byId[followedId];

    const created = moment.utc().format();
    const followerData = {
      firstName: user.firstName,
      lastName: user.lastName,
      photoUrl: user.photoUrl,
      userId: user.uid,
      created,
      status: true
    };
    const followedData = {
      firstName,
      lastName,
      photoUrl,
      userId: followedId,
      created,
      status: true
    };

    // if (isAlreadyFollowing(user.uid, followedId, followStatuses)) {
    //   return;
    // }

    dispatch(followUserRequest({ followerData, followedData }));
    addFollower(followerData, followedData)
      .then(result => {
        dispatch(followUserSuccess(result));
        dispatch(followRequestPending(false));
      })
      .catch(() => {
        dispatch(followUserFailure());
        dispatch(followRequestPending(false));
      });
};
};

export const followRequestPending = (status) => {
    return {
      type: FOLLOW_REQUEST_PENDING,
      payload: status
    };
};

export const unFollowRequestPending = (status) => {
    return {
      type: UNFOLLOW_REQUEST_PENDING,
      payload: status
    };
};

const isAlreadyFollowing = (followerId, followedId, followStatuses) => {
  return followStatuses[followerId].following[followedId].status;
};

export const unfollowUser = followedId => {
  return (dispatch, getState) => {
    const { user, followStatuses } = getState();
      dispatch(unFollowRequestPending(true));
    const { uid: followerId } = user;
    // if (!isAlreadyFollowing(followerId, followedId, followStatuses)) {
    //   return;
    // }

    dispatch(unfollowUserRequest({ followerId, followedId }));
    removeFollower(followerId, followedId)
      .then(result => {
         dispatch(unfollowUserSuccess(result));
         dispatch(unFollowRequestPending(false));
       })
      .catch(() => {
        dispatch(unfollowUserFailure());
        dispatch(unFollowRequestPending(false));
      });
};
};

export const fetchUserFollowers = userId => {
  return dispatch => {
    fetchFollowers(userId)
      .then(followers => {
        dispatch(fetchFollowersSuccess({ followers, userId }));
      })
      .catch(() => dispatch(fetchFollowersFailure()));
  };
};

export const fetchUserFollowing = userId => {
  return dispatch => {
    fetchFollowing(userId)
      .then(following => {
        dispatch(fetchFollowingSuccess({ following, userId }));
      })
      .catch(() => dispatch(fetchFollowingFailure()));
  };
};

export const fetchFollowersSuccess = payload => {
  return {
    type: FETCH_FOLLOWERS_SUCCESS,
    payload
  };
};

export const fetchFollowingSuccess = payload => {
  return {
    type: FETCH_FOLLOWING_SUCCESS,
    payload
  };
};

export const followUserRequest = payload => {
  return {
    type: FOLLOW_USER_REQUEST,
    payload
  };
};

export const followUserSuccess = payload => {
  return {
    type: FOLLOW_USER_SUCCESS,
    payload
  };
};

export const followUserFailure = () => {
  return {
    type: FOLLOW_USER_FAILURE
  };
};

export const unfollowUserRequest = payload => {
  return {
    type: UNFOLLOW_USER_REQUEST,
    payload
  };
};

export const unfollowUserSuccess = payload => {
  return {
    type: UNFOLLOW_USER_SUCCESS,
    payload
  };
};

export const unfollowUserFailure = payload => {
  return {
    type: UNFOLLOW_USER_FAILURE,
    payload
  };
};

export const fetchFollowersFailure = payload => {
  return {
    type: FETCH_FOLLOWERS_FAILURE,
    payload
  };
};

export const fetchFollowingFailure = payload => {
  return {
    type: FETCH_FOLLOWING_FAILURE,
    payload
  };
};

export const loadFollowingStatus = followedId => {
  return (dispatch, getState) => {
    dispatch(loadFollowingStatusRequest(followedId));

    const { user, followStatuses } = getState();
    const userFollowStatuses = followStatuses[user.uid];

    // User clicked on own profile
    if (user.uid === followedId) {
      const status = { status: false };
      dispatch(loadFollowingStatusSuccess({ followerId: user.uid, followedId, status }));
      return;
    }

    if (userFollowStatuses && userFollowStatuses.following[followedId] != null) {
      const status = { status: userFollowStatuses.following[followedId].status };
      dispatch(loadFollowingStatusSuccess({ followerId: user.uid, followedId, status }));
      return;
    }

    fetchFollowingStatus(user.uid, followedId)
      .then(status => {
        dispatch(loadFollowingStatusSuccess({ followerId: user.uid, followedId, status }));
      })
      .catch(() => dispatch(loadFollowingStatusFailure({ followerId: user.uid, followedId })));
  };
};

const loadFollowingStatusRequest = followedId => {
  return {
    type: LOAD_FOLLOWING_STATUS_REQUEST,
    payload: { followedId }
  };
};

const loadFollowingStatusSuccess = payload => {
  return {
    type: LOAD_FOLLOWING_STATUS_SUCCESS,
    payload
  };
};

const loadFollowingStatusFailure = payload => {
  return {
    type: LOAD_FOLLOWING_STATUS_FAILURE,
    payload
  };
};
