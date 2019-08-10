import {
  FOLLOW_USER_SUCCESS,
  LOAD_FOLLOWING_STATUS_SUCCESS,
  UNFOLLOW_USER_SUCCESS,
  FETCH_FOLLOWERS_SUCCESS,
  FETCH_FOLLOWING_SUCCESS,
  FOLLOW_USER_REQUEST,
  UNFOLLOW_USER_REQUEST,
  FOLLOW_REQUEST_PENDING,
  UNFOLLOW_REQUEST_PENDING
} from '../../types/fetch-status.types';

const INITIAL_STATE = { isRequestActive: false };

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FOLLOW_USER_REQUEST:
    case UNFOLLOW_USER_REQUEST:
      const { followerData, followedData, followerId, followedId } = action.payload;
      const followerUserId = followerData ? followerData.userId : followerId;
      const followedUserId = followedData ? followedData.userId : followedId;

      const newRequestState = {
        ...state,
        [followerUserId]: {
          followers: state[followerUserId].followers,
          following: {
            ...state[followerUserId].following,
            [followedUserId]: {
              ...(state[followerUserId].following[followedUserId] || {}),
              loading: true
            }
          }
        }
      };

      return newRequestState;

    case FOLLOW_REQUEST_PENDING:
    case UNFOLLOW_REQUEST_PENDING:
      return { ...state, isRequestActive: action.payload };

    case LOAD_FOLLOWING_STATUS_SUCCESS: {
      const { followerId, followedId, status } = action.payload;

      if (!state[followerId]) {
        return {
          ...state,
          [followerId]: {
            followers: {},
            following: { [followedId]: status }
          }
        };
      }

      const updatedUser = getUpdatedUserFollowStatus(state, followerId, followedId, status);
      return { ...state, [followerId]: updatedUser };
    }

    case FOLLOW_USER_SUCCESS:
      return followUserSuccess(state, action);

    case UNFOLLOW_USER_SUCCESS:
      return unfollowUserSuccess(state, action);

    case FETCH_FOLLOWERS_SUCCESS:
      const followers = action.payload;
      return { ...state, followers };
    
    case FETCH_FOLLOWING_SUCCESS: {
      const { following, userId } = action.payload;

      if (!state[userId]) {
        return {
          ...state,
          [userId]: {
            followers: {},
            following: following || {}
          }
        };
      }

      return {
        ...state,
        [userId]: {
          followers: state[userId].followers,
          following: following || {}
        }
      };
    }

    default:
      return state;
  }
};

const followUserSuccess = (state, action) => {
  const { followerResult, followedResult } = action.payload;
  const { userId: followerId } = followerResult;
  const { userId: followedId } = followedResult;
  const updatedUser = getUpdatedUserFollowStatus(state, followerId, followedId, { status: true });

  return { ...state, [followerId]: updatedUser };
};

const unfollowUserSuccess = (state, action) => {
  const { followerResult, followedResult } = action.payload;
  const { userId: followerId } = followerResult;
  const { userId: followedId } = followedResult;
  const updatedUser = getUpdatedUserFollowStatus(state, followerId, followedId, { status: false });

  return { ...state, [followerId]: updatedUser };
};

getUpdatedUserFollowStatus = (state, followerId, followedId, status) => {
  const updatedFollowingForUser = { ...state[followerId].following[followedId], ...status, loading: false };
  const updatedFollowing = {
    ...state[followerId].following,
    [followedId]: updatedFollowingForUser
  };
  const updatedUserFollowStatus = { ...state[followerId], following: updatedFollowing };

  return updatedUserFollowStatus;
};
