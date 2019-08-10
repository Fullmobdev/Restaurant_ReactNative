export const APP_ROOT_PATH = '/app';
export const FOLLOW_STATUS_PATH = `${APP_ROOT_PATH}/FollowStatusByUser`;
export const FOLLOW_STATUS_AGGREGATES_PATH = `${APP_ROOT_PATH}/FollowStatusAggregatesByUser`;
export const NUM_FOLLOWERS = 'numFollowers';
export const NUM_FOLLOWING = 'numFollowing';

export const getFollowerUserPath = (followerId, followedId) => {
  return `${FOLLOW_STATUS_PATH}/${followedId}/followers/${followerId}`;
};

export const getFollowerStatusUserPath = (followerId, followedId) => {
  return `${FOLLOW_STATUS_PATH}/${followedId}/followers/${followerId}/status`;
};

export const getFollowerNumFollowingPath = (followerId, followedId) => {
  return `${FOLLOW_STATUS_PATH}/${followedId}/followers/${followerId}/numFollowing`;
};

export const getFollowingUserPath = (followerId, followedId) => {
  return `${FOLLOW_STATUS_PATH}/${followerId}/following/${followedId}`;
};

export const getFollowingStatusUserPath = (followerId, followedId) => {
  return `${FOLLOW_STATUS_PATH}/${followerId}/following/${followedId}/status`;
};
export const getFollowingNumFollowerPath = (followerId, followedId) => {
  return `${FOLLOW_STATUS_PATH}/${followerId}/following/${followedId}/numFollowers`;
};

export const getAggregatesPath = userId => {
  return `${FOLLOW_STATUS_AGGREGATES_PATH}/${userId}`;
};

export const getUserFollowersPath = userId => {
  return `${FOLLOW_STATUS_PATH}/${userId}/followers`;
};

export const getUserFollowingPath = userId => {
  return `${FOLLOW_STATUS_PATH}/${userId}/following`;
};
