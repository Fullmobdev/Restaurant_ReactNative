import { REHYDRATE } from 'redux-persist/lib/constants';

import {
  NAME_FIELD_SUBMITTED,
  EMAIL_FIELD_SUBMITTED,
  PASSWORD_FIELD_SUBMITTED,
  CREATE_USER_SUCCESS,
  LOGIN_USER_SUCCESS,
  LOGIN_GUEST_SUCCESS,
  LOGIN_USER_FAILURE,
  LOGOUT_USER_SUCCESS,
  USER_TYPE,
  GUEST_TYPE
} from '../../types/authentication.types';
import {
  FETCH_REVIEWS_SUCCESS,
  FETCH_REVIEW_EXTENSION_BY_VIEWER_SUCCESS,
  FETCH_USER_REVIEWS_SUCCESS,
  ADD_REVIEWS_SUCCESS,
  UPDATE_LIKES,
  UPDATE_VIEWS,
  ADD_USER_REVIEWS_SUCCESS
} from '../../types/review.types';
import {
  FETCH_BUSINESS_BOOKMARKS_SUCCESS,
  FETCH_BUSINESS_USER_RECOMMENDATION_SUCCESS,
  BOOKMARK_BUSINESS_SUCCESS
} from '../../types/business.types';

import {
  FETCH_FOLLOWERS_SUCCESS,
  FETCH_FOLLOWING_SUCCESS,
  FOLLOW_USER_SUCCESS,
  UNFOLLOW_USER_SUCCESS
} from '../../types/fetch-status.types';

import {
  LOAD_USER_ADDRESS_REQUEST,
  LOAD_USER_ADDRESS_SUCCESS,
  LOAD_USER_AGGREGATES_SUCCESS,
  LOAD_USER_REWARDS_SUCCESS,
  USER_REWARDS_UPDATE,
  USER_PROFILE_PIC_UPDATE
} from '../../types/users.types';

/**
 * This object represents the user state
 * which will be used to maintain state of
 * the user during authentication process
 * and post successful user login.
 */
export const INITIAL_STATE = {
  address: {},
  loaded: '',
  uid: '',
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  telephone: '',
  countryCode: '',
  created: '',
  lastLogin: '',
  provider: '',
  photoUrl: '',
  userType: '',
  recommendations: {},
  reviewsIds: [],
  viewedReviewList: {},
  visitsViewedStatus: {},
  following: {},
  followers: {},
  bookmarks: {},
  isAnonymous: false
};

export default (state = INITIAL_STATE, action) => {
  //console.log(action);
  switch (action.type) {
    case USER_PROFILE_PIC_UPDATE:
      return { ...state, photoUrl: action.payload };

    case REHYDRATE:
      const { key, payload } = action;

      if (key !== 'root') {
        return state;
      }

      let savedState = {};
      if (payload && payload.user) {
        savedState = payload.user;
      }

      return {
        ...state,
        ...savedState,
        address: {},
        reviewsIds: [],
        recommendations: {},
        visitsViewedStatus: {},
        bookmarks: {}
      };

    case LOAD_USER_AGGREGATES_SUCCESS: {
      const { aggregates, userId } = action.payload;
      const { uid } = state;
      if (uid !== userId) return state;

      return { ...state, aggregates };
    }

    case NAME_FIELD_SUBMITTED:
      return {
        ...state,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName
      };

    case EMAIL_FIELD_SUBMITTED:
      return { ...state, email: action.payload };

    case PASSWORD_FIELD_SUBMITTED:
      return { ...state, password: action.payload };

    /* TODO - Need to grab all data from user object
     * returned by firebase and set the redux state
     * attributes as appropriate
     */
    case CREATE_USER_SUCCESS:
    case LOGIN_USER_SUCCESS:
        return getUserDetails(state, action, USER_TYPE);

        case LOGIN_GUEST_SUCCESS:
        return getUserDetails(state, action, GUEST_TYPE);
    case FETCH_REVIEWS_SUCCESS:
      const { payload: fetchSuccessReviews } = action;
      let updatedVisitsViewedStatus = getFetchedVisitsViewedStatus(
        fetchSuccessReviews,
        state.viewedReviewList
      );

      updatedVisitsViewedStatus = { ...state.visitsViewedStatus, ...updatedVisitsViewedStatus };

      return { ...state, visitsViewedStatus: updatedVisitsViewedStatus };

    case FETCH_BUSINESS_USER_RECOMMENDATION_SUCCESS: {
      const { businessId, recommendation } = action.payload;

      if (action.payload.userId !== state.uid || !recommendation) {
        return state;
      }

      const updatedBusinessRecommendation = {
        ...state.recommendations[businessId],
        ...recommendation
      };

      const updatedRecommendations = {
        ...state.recommendations,
        [businessId]: updatedBusinessRecommendation
      };

      return { ...state, recommendations: updatedRecommendations };
    }

    case FETCH_REVIEW_EXTENSION_BY_VIEWER_SUCCESS:
      const extensions = action.payload;
      const viewedReviewList = {};

      extensions.forEach(extension => {
        const reviewId = extension.reviewId;
        const likeStatus = extension.liked;
        const viewedStatus = extension.viewed;

        viewedReviewList[reviewId] = { likeStatus, viewedStatus };
      });
      return { ...state, ...{ viewedReviewList } };

    case UPDATE_LIKES: {
      const { reviewId, likeStatus } = action.payload;
      const existingReviewList = { ...state.viewedReviewList };

      const updateResult = { [reviewId]: { ...state[reviewId], likeStatus, viewedStatus: true } };
      const newReviewList = { viewedReviewList: { ...existingReviewList, ...updateResult } };

      return { ...state, ...newReviewList };
    }

    case UPDATE_VIEWS:
      const { reviewId, viewedStatus, visitId: updatedViewsVisitId } = action.payload;
      const existingReviewList = { ...state.viewedReviewList };

      const currentReviewId = existingReviewList[reviewId];
      let newReviewList = {};

      if (currentReviewId == null) {
        //This review has not been viewed before, set it to viewed
        const updateResult = {
          [reviewId]: { ...state[reviewId], viewedStatus, likeStatus: false }
        };
        newReviewList = { viewedReviewList: { ...existingReviewList, ...updateResult } };
      }

      const visitViewedStatus = state.visitsViewedStatus[updatedViewsVisitId];
      let newVisitViewedStatus = {};

      if (visitViewedStatus) {
        const updatedVisitStatus = getUpdatedVisitViewedStatus(visitViewedStatus, reviewId);

        newVisitViewedStatus = {
          ...state.visitsViewedStatus,
          [updatedViewsVisitId]: updatedVisitStatus
        };
        return { ...state, ...newReviewList, visitsViewedStatus: newVisitViewedStatus };
      }

      return { ...state, ...newReviewList };

   case LOAD_USER_ADDRESS_REQUEST:
    return { ...state, loaded: false };

    case LOAD_USER_ADDRESS_SUCCESS:
      const { address } = action.payload;
      return { ...state, address };

    case LOGIN_USER_FAILURE:
    case LOGOUT_USER_SUCCESS:
      return { ...INITIAL_STATE };

    case FETCH_USER_REVIEWS_SUCCESS:
      const { userId, reviews: visits } = action.payload;
      const existingReviewIds = {};

      if (state.uid !== userId) {
        return state;
      }

      state.reviewsIds.forEach(reviewId => {
        existingReviewIds[reviewId] = reviewId;
      });

      let reviewsIds = [];

      const loadedReviewIds = [];
      visits.forEach(visit => {
        Object.values(visit).forEach(entry => {
          const reviewId = entry.reviewId;
          if (reviewId) {
            loadedReviewIds.push(reviewId);
          }
        });
      });

      const newFetchReviewsIds = [];
      loadedReviewIds.forEach(reviewId => {
        if (!existingReviewIds[reviewId]) {
          newFetchReviewsIds.push(reviewId);
        }
      });

      reviewsIds = Object.keys(existingReviewIds).concat(newFetchReviewsIds);

      const newState = { ...state, reviewsIds };
      return newState;

    case ADD_USER_REVIEWS_SUCCESS:
      const { userId: addSuccessUserId, reviews: addSuccessVisits, toLocation } = action.payload;

      if (state.uid !== addSuccessUserId) {
        return state;
      }

      let newReviewsIds = [];
      let addSuccessReviewsIds = [];

      addSuccessVisits.forEach(visit => {
        const { lastReviewCreatedTime, userIdLastReviewCreatedTime, visitId, ...rest } = visit;
        newReviewsIds = newReviewsIds.concat(Object.keys(rest));
      });

      const currentReviewsIds = state.reviewsIds;

      if (toLocation && toLocation === 'front') {
        addSuccessReviewsIds = [...newReviewsIds, ...currentReviewsIds];
      } else {
        addSuccessReviewsIds = [...currentReviewsIds, ...newReviewsIds];
      }

      const ret = { ...state, reviewsIds: addSuccessReviewsIds };
      return ret;

    case ADD_REVIEWS_SUCCESS: {
      const toLocation = action.payload.toLocation;
      const visits = action.payload.reviews;
      const { uid, reviewsIds } = state;

      if (!visits) {
        return state;
      }

      const newReviewsMap = {};
      let updatedReviewsIds = [];

      visits.forEach(visit => {
        const userIdLastReviewCreatedTime = visit.userIdLastReviewCreatedTime;
        if (userIdLastReviewCreatedTime.includes(uid)) {
          //only update my reviewsIds for my reviews
          Object.values(visit).forEach(entry => {
            const reviewId = entry.reviewId;

            if (reviewId && !reviewsIds.includes(reviewId)) {
              //only add to user list if N/A
              updatedReviewsIds.push(reviewId);
              newReviewsMap[reviewId] = entry;
            }
          });
        } else {
          // Note: We only want to update reviewIds in this reducer when user creates a new review (
          // the location would be front ) and when we load user reviews in the profile page
          updatedReviewsIds = state.reviewsIds;

          const updatedVisitsViewedStatuses = getFetchedVisitsViewedStatus(
            visits,
            state.viewedReviewList
          );
          addedReviewsVisitViewedStatus = {
            ...state.visitsViewedStatus,
            ...updatedVisitsViewedStatuses
          };
        }
      });

      //TODO - don't add a review to the list if it already exists in state
      //This just means it was redelivered due to onValue() in firebase
      let addedReviewsVisitViewedStatus = {};
      if (toLocation === 'front') {
        updatedReviewsIds = updatedReviewsIds.concat(state.reviewsIds);

        visits.forEach(visitObj => {
          const { visitId } = visitObj;
          const addedRviewVisitViewedStatus = state.visitsViewedStatus[visitId];

          const updatedVisitStatus = getAddedReviewVisitViewedStatus(
            addedRviewVisitViewedStatus,
            visitObj
          );
          addedReviewsVisitViewedStatus = {
            ...state.visitsViewedStatus,
            [visitId]: updatedVisitStatus
          };
        });
      } else {
        // Note: We only want to update reviewIds in this reducer when user creates a new review (
        // the location would be front ) and when we load user reviews in the profile page
        updatedReviewsIds = state.reviewsIds;

        const updatedVisitsViewedStatuses = getFetchedVisitsViewedStatus(
          visits,
          state.viewedReviewList
        );
        addedReviewsVisitViewedStatus = {
          ...state.visitsViewedStatus,
          ...updatedVisitsViewedStatuses
        };
      }

      const newState = {
        ...state,
        reviewsIds: updatedReviewsIds,
        ...newReviewsMap,
        visitsViewedStatus: addedReviewsVisitViewedStatus
      };
      return newState;
    }

    case BOOKMARK_BUSINESS_SUCCESS: {
      const { businessId, bookmarked } = action.payload;
      let existingBookmarks = { ...state.bookmarks };

      let updateResult = {};

      if (bookmarked === true) {
        updateResult = { [businessId]: { bookmarked } };
      } else {
        delete existingBookmarks[businessId];
        existingBookmarks = { ...existingBookmarks };
      }

      const newBookmarks = { bookmarks: { ...existingBookmarks, ...updateResult } };
      return { ...state, ...newBookmarks };
    }

    case FETCH_BUSINESS_BOOKMARKS_SUCCESS: {
      const bookmarks = action.payload;
      const existingBookmarks = { ...state.bookmarks };
      const updateResult = {};
      bookmarks.forEach(bookmark => {
        let { businessId, bookmarked } = bookmark;
        //TODO - The logic below (businessId && bookmarked == null) should be removed once we
        //do a data migration for bookmarks.
        //Below logic will safeguard bookmarks that were done historically and still have the
        //old data format in the database.
        if ((businessId && bookmarked == null) || bookmarked === true) {
          bookmarked = true;
          updateResult[businessId] = { bookmarked };
        }
      });

      const newBookmarks = { bookmarks: { ...existingBookmarks, ...updateResult } };
      return { ...state, ...newBookmarks };
    }

    case FETCH_FOLLOWERS_SUCCESS:
      const { followers } = action.payload;
      return {
        ...state,
        followers: {
          ...state.followers,
          [action.payload.userId]: followers
        }
      };

    case FETCH_FOLLOWING_SUCCESS:
      const { following } = action.payload;
      return {
        ...state,
        following: {
          ...state.following,
          [action.payload.userId]: following
        }
      };

    case FOLLOW_USER_SUCCESS: {
      const { followedResult, followerResult } = action.payload;
      return {
        ...state,
        following: {
          ...state.following,
          [followerResult.userId]: {
            ...state.following[followerResult.userId],
            [followedResult.userId]: followedResult
          }
        },
        followers: {
          ...state.followers,
          [followedResult.userId]: {
            ...state.followers[followedResult.userId],
            [followerResult.userId]: followerResult
          }
        }
      };
    }

    case UNFOLLOW_USER_SUCCESS: {
      const { followedResult, followerResult } = action.payload;
      return {
        ...state,
        following: {
          ...state.following,
          [followerResult.userId]: {
            ...state.following[followerResult.userId],
            [followedResult.userId]: followedResult
          }
        },
        followers: {
          ...state.followers,
          [followedResult.userId]: {
            ...state.followers[followedResult.userId],
            [followerResult.userId]: followerResult
          }
        }
      };
    }

    case LOAD_USER_REWARDS_SUCCESS: {
      let { rewardsActivity } = action.payload;

      rewardsActivity = rewardsActivity || {};
      const rewardsTotal = calculateRewardsTotal(rewardsActivity);

      const rewards = {
        total: rewardsTotal,
        activity: rewardsActivity
      };

      return { ...state, rewards };
    }

    case USER_REWARDS_UPDATE: {
      const { review, activity } = action.payload;

      const currentRewards = state.rewards || { total: 0, activity: {} };
      let currentTotal = currentRewards.total;
      const previous = currentRewards.activity[review];

      if (previous) {
        Object.values(previous).forEach(activityType => {
          currentTotal -= activityType.ammount;
        });
      }

      Object.values(activity).forEach(activityType => {
        currentTotal += activityType.ammount;
      });

      const updatedActivity = { ...currentRewards.activity, [review]: activity };
      const updatedRewards = { ...currentRewards, total: currentTotal, activity: updatedActivity };
      const updatedState = { ...state, rewards: updatedRewards };
      return updatedState;
    }
    default:
      return state;
  }
};

const calculateRewardsTotal = (rewardsActivity) => {
  let rewardsTotal = 0;

  Object.values(rewardsActivity).forEach(reviewActivities => {
    Object.values(reviewActivities).forEach(activity => {
      rewardsTotal += activity.ammount;
    });
  });

  return rewardsTotal;
};

const getFetchedVisitsViewedStatus = (fetchSuccessReviews, viewedReviewList) => {
  const updatedVisitsViewedStatus = {};

  fetchSuccessReviews.forEach(fetchSuccessReview => {
    const {
      lastReviewCreatedTime,
      userIdLastReviewCreatedTime,
      visitId,
      ...rest
    } = fetchSuccessReview;

    const fetchSuccessReviewIds = Object.keys(rest);
    let firstReviewToWatchIndex = null;

    // TODO: sort the reviews
    fetchSuccessReviewIds.some((reviewId, index) => {
      if (!viewedReviewList[reviewId]) {
        firstReviewToWatchIndex = index;
        return true;
      }
      return false;
    });

    const reviewsToWatch =
      firstReviewToWatchIndex !== null ? fetchSuccessReviewIds.slice(firstReviewToWatchIndex) : [];

    firstReviewToWatchIndex =
      firstReviewToWatchIndex !== null ? firstReviewToWatchIndex : fetchSuccessReviewIds.length;

    updatedVisitsViewedStatus[visitId] = {
      firstReviewToWatchIndex,
      reviewsToWatch
    };
  });

  return updatedVisitsViewedStatus;
};

const getUpdatedVisitViewedStatus = (currentStatus, viewedReviewId) => {
  let firstReviewToWatchIndex = null;

  currentStatus.reviewsToWatch.some((reviewToWatchId, index) => {
    if (reviewToWatchId === viewedReviewId) {
      firstReviewToWatchIndex = index + 1;
      return true;
    }
    return false;
  });

  let reviewsToWatch = currentStatus.reviewsToWatch;

  if (firstReviewToWatchIndex === null) {
    return {
      firstReviewToWatchIndex: currentStatus.firstReviewToWatchIndex,
      reviewsToWatch
    };
  }

  reviewsToWatch = currentStatus.reviewsToWatch.slice(firstReviewToWatchIndex);
  firstReviewToWatchIndex =
    reviewsToWatch.length > 0
      ? firstReviewToWatchIndex + currentStatus.firstReviewToWatchIndex
      : currentStatus.firstReviewToWatchIndex + currentStatus.reviewsToWatch.length;

  return {
    firstReviewToWatchIndex,
    reviewsToWatch
  };
};

const getAddedReviewVisitViewedStatus = (currentStatus, addedVisit) => {
  const { lastReviewCreatedTime, userIdLastReviewCreatedTime, visitId, ...rest } = addedVisit;

  if (!currentStatus) {
    return {
      firstReviewToWatchIndex: 0,
      reviewsToWatch: Object.keys(rest)
    };
  }

  const { reviewsToWatch: currentReviewsToWatch, firstReviewToWatchIndex } = currentStatus;
  const addedReviews = Object.keys(rest).slice(
    firstReviewToWatchIndex + currentReviewsToWatch.length
  );
  const reviewsToWatch = [...currentReviewsToWatch, ...addedReviews];

  return {
    firstReviewToWatchIndex,
    reviewsToWatch
  };
};

const getUserDetails = (state, action, userType) => {
  const result = {
    ...(state || {}),
    uid: action.payload.uid,
    firstName: action.payload.firstName,
    lastName: action.payload.lastName,
    email: action.payload.email,
    provider: action.payload.provider,
    telephone: action.payload.telephone,
    countryCode: action.payload.countryCode,
    created: action.payload.created,
    lastLogin: action.payload.lastLogin,
    photoUrl: action.payload.photoUrl,
    isAnonymous: action.payload.isAnonymous,
    userType
  };

  return result;
};
