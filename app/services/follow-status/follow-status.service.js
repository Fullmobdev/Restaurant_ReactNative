import firebase from 'react-native-firebase';
import {
  getFollowerUserPath,
  getFollowingUserPath,
  getFollowerStatusUserPath,
  getFollowingStatusUserPath,
  getAggregatesPath,
  NUM_FOLLOWERS,
  NUM_FOLLOWING,
  getUserFollowersPath,
  getUserFollowingPath
} from './follow-status.endpoints';
import { getDatabaseReferenceByPath, updateGroup } from '../db-access.service';

export const addFollower = (follower, followed) => {
  const { userId: followerId } = follower;
  const { userId: followedId } = followed;

  const addFollowerPath = getFollowerUserPath(followerId, followedId);
  const addFollowingPath = getFollowingUserPath(followerId, followedId);
  const val = 1;

  return Promise.all([
    updateNumFollowers(followedId, val),
    updateNumFollowing(followerId, val)
  ]).then(transactionResults => {
    const followedAggregates = transactionResults[0].snapshot.val();
    const followerAggregates = transactionResults[1].snapshot.val();

    const followerResult = { ...follower };
    const followedResult = { ...followed };
    const updates = {
      [addFollowerPath]: followerResult,
      [addFollowingPath]: followedResult
    };

    return makeFollowerUpdates(updates, followerResult, followedResult);
  });
};

export const removeFollower = (followerId, followedId) => {
  const removeFollowerStatusPath = getFollowerStatusUserPath(followerId, followedId);
  const removeFollowingStatusPath = getFollowingStatusUserPath(followerId, followedId);
  const val = -1;

  return Promise.all([
    updateNumFollowers(followedId, val),
    updateNumFollowing(followerId, val)
  ]).then(transactionResults => {
    const followedAggregates = transactionResults[0].snapshot.val();
    const followingAggregates = transactionResults[1].snapshot.val();

    const followerResult = { userId: followerId, ...followingAggregates, status: false };
    const followedResult = { userId: followedId, ...followedAggregates, status: false };
    const updates = {
      [removeFollowerStatusPath]: false,
      [removeFollowingStatusPath]: false
    };

    return makeFollowerUpdates(updates, followerResult, followedResult);
  });
};

const makeFollowerUpdates = (updates, followerResult, followedResult) => {
  return updateGroup(updates).then(() => {
    return {
      followerResult,
      followedResult
    };
  });
};

export const fetchFollowingStatus = (followerId, followedId) => {
  const path = getFollowingUserPath(followerId, followedId);

  return getDatabaseReferenceByPath(path)
    .once('value')
    .then(snapshot => {
      return {
        status: !!snapshot.child('status').val()
      };
    });
};

export const fetchFollowAggregates = userId => {
  const path = getAggregatesPath(userId);
  return getDatabaseReferenceByPath(path)
    .once('value')
    .then(snapshot => snapshot.val());
};

export const fetchFollowers = userId => {
  const path = getUserFollowersPath(userId);
  return getDatabaseReferenceByPath(path)
    .once('value')
    .then(snapshot => snapshot.val());
};

export const fetchFollowing = userId => {
  const path = getUserFollowingPath(userId);
  return getDatabaseReferenceByPath(path)
    .once('value')
    .then(snapshot => snapshot.val());
};

const updateNumFollowers = (userId, val) => {
  return updateAggregates(userId, NUM_FOLLOWERS, val);
};

const updateNumFollowing = (userId, val) => {
  return updateAggregates(userId, NUM_FOLLOWING, val);
};

const updateAggregates = (userId, aggregateProperty, val) => {
  const path = getAggregatesPath(userId);

  return firebase
    .database()
    .ref(path)
    .transaction(aggregates => {
      if (!aggregates) {
        const updatedAggregates = { numFollowers: 0, numFollowing: 0 };
        updatedAggregates[aggregateProperty] = 1;
        return updatedAggregates;
      }

      aggregates[aggregateProperty] += val;
      return aggregates;
    });
};
