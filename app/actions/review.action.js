import _ from 'lodash';
import moment from 'moment';
import * as mediaOperations from '../services/media/media.operations';

// Redux types
import {
  FETCH_REVIEWS_FOR_VISIT_ID,
  CREATE_REVIEW_REQUEST,
  CREATE_REVIEW_SUCCESS,
  CREATE_REVIEW_FAILURE,
  FETCH_REVIEWS,
  REVIEW_SELECTED,
  FETCH_USER_REVIEWS_REQUEST,
  FETCH_USER_REVIEWS_SUCCESS,
  FETCH_USER_REVIEWS_FAILURE,
  FILTER_BUSINESS_REVIEWS,
  ADD_USER_REVIEWS_REQUEST,
  ADD_USER_REVIEWS_SUCCESS,
  ADD_USER_REVIEWS_FAILURE,
  FETCH_REVIEWS_REQUEST,
  FETCH_REVIEWS_SUCCESS,
  FETCH_REVIEW_EXTENSION_REQUEST,
  FETCH_REVIEW_EXTENSION_SUCCESS,
  FETCH_REVIEWS_ERROR,
  ADD_REVIEWS_SUCCESS,
  UPDATE_LIKES,
  UPDATE_VIEWS,
  FETCH_RECOMMENDATIONS_BY_USERS,
  VISIT_SELELCT,
  PROGRESS_BAR_DETAILS,
  ADD_INITIAL_LINK,
  FETCH_REVIEW_EXTENSION_BY_VISIT_REQUEST,
  FETCH_REVIEW_EXTENSION_BY_VISIT_FAILURE,
  FETCH_REVIEW_EXTENSION_BY_VISIT_SUCCESS
} from '../types/review.types';
import { SET_BUSINESS_USER_RECOMMENDATION_SUCCESS } from '../types/business.types';

//Database End points
import {
  BUSINESS_ROOT_PATH,
  BUSINESS_BY_API_ROOT_PATH
} from '../services/business/business-endpoints';
import { BUSINESS_RECOMMENDATIONS_PATH } from '../services/recommendation/recommendation-endpoints';
import {
  BUSINESS_REVIEWS_PATH,
  USER_REVIEWS_PATH,
  REVIEWS_PATH,
  REVIEWS_EXTENSION_PATH,
  REVIEWS_EXTENSION_BY_VIEWER_PATH,
  REVIEWS_EXTENSION_BY_REVIEW_PATH
} from '../services/review/review-endpoints';
import { momentFilterCleared } from './moment.action';
import { fetchUserProfilePicture, addUserToList } from './users/users.action';

// Services
import * as recommendationService from '../services/recommendation/recommendation.service';
import * as DBService from '../services/db-access.service';
import * as mediaService from '../services/media/media.service';
import * as businessService from '../services/business/business.service';
import * as fetchService from '../services/reviews/fetch-reviews.service';
import * as reviewService from '../services/review/review.service';
import * as authService from '../services/authentication/authentication.service';
import * as userService from '../services/user/user.service';

// Constants
const API_ID = 'apiId';

export const addInitialLink = (payload) => {
  return dispatch => {
    dispatch({
      type: ADD_INITIAL_LINK,
      payload
    });
  };
};

export const reviewSelected = reviewObject => {
  return dispatch => {
    const { businessId, index, reviewIds } = reviewObject;
    dispatch({ type: REVIEW_SELECTED, payload: { businessId, index, reviewIds } });
  };
};


/**
 * Updates the state of a progress bar for a currently
 * playing review. Allows other components displaying a review
 * to have their own progress component but still stay in sync.
 * @param Details object of the form
 * { currentIndex: number; duration: number; numberOfReviews: number; }
 */
export const progressBarDetails = (details) => {
  return {
    type: PROGRESS_BAR_DETAILS,
    payload: details
  };
};

/**
 * Retrieve all reviews associated with a given business from firebase,
 * update the redux store with reviews retrieved and continue updating
 * the store with new reviews until the stream is closed by calling
 * detatchReviewsListner in the review.service
 * @param {String} businessId
 * @param {String} businessCategory
 */
export const fetchReviewsForBusiness = (businessId, businessCategory) => {
  return (dispatch, getState) => {
    const { businesses, businessReviews, user } = getState();
    const { filterBy } = businessReviews;
    /**
     * We've already fetched reviews, no need to check again since it'll update automatically
     */
    const business = businesses[businessId];
    if (business && business.reviews && business.reviews.length > 0) return;

    const path = getBusinessReviewPathForId(businessId, businessCategory);
    DBService.getDatabaseReferenceByPath(path).on('value', snapshot => {
      const reviews = [];
      snapshot.forEach(data => {
        const visit = data.val();
        visit.isUserReview = false;
        
        const userId = visit.userIdLastReviewCreatedTime.split('-')[0];
        const { uid } = user;
        if (uid === userId) {
          visit.isUserReview = true;
          const visitId = data.key;
          dispatch(fetchReviewExtensionByVisit(visitId));
        }

        reviews.push({ visitId: data.key, ...visit });
      });
      dispatch(
        {
          type: FETCH_REVIEWS,
          payload: { businessId, filterBy, reviews }
        },
        { allowMore: true }
      );
    });
  };
};

export const fetchReviewsForVisitId = (visitId) => {
  const path = `${REVIEWS_PATH}/${visitId}`;
  return (dispatch, getState) => {
    return DBService.getDatabaseReferenceByPath(path).on('value', snapshot => {
    const reviews = [];
    snapshot.forEach((data) => {
      const val = data.val();
      if (_.isString(val) && val.length > 25) {
        const userId = val.split('-')[0];
        const { users, user } = getState();
        if (users.byId.usersList[userId] === undefined || user.uid !== userId) {
            dispatch(addUserToList(userId));
            dispatch(fetchUserProfilePicture(userId));
        }
      }
      reviews.push(val);
    });


    dispatch({
      type: FETCH_REVIEWS_FOR_VISIT_ID,
      payload: reviews
    });
   });
 };
};

/*
Function will trigger for every new review that's added after initial load.
It will trigger twice. First for the receipt of all of the already existing
reviews associated with this visit that are already in the firebase local
cache and second for newly added review that was added to the firebase database.
*/
export const watchFirebaseForUpdates = (orderBy, path) => {
  let initialDataLoaded = false;

  return (dispatch, getState) => {
    dispatch({ type: FETCH_REVIEWS_REQUEST });
    fetchService.fetchReviews(1, orderBy, path).on(
      'value',
      snapshot => {
        if (initialDataLoaded) {
          const { user } = getState();
          const reviews = fetchService.generateReviewsFromFirebaseSnapshot(snapshot);
          reviews.forEach(visit => {
            const userId = visit.userIdLastReviewCreatedTime.split('-')[0];
            visit.isUserReview = user.uid === userId;
            if (visit.isUserReview) {
              dispatch(fetchReviewExtensionByVisit(visit.visitId));
            }
          });

          addReviewsSuccess(dispatch, { reviews, toLocation: 'front' });
        } else {
          initialDataLoaded = true;
        }
      },
      error => fetchReviewsError(dispatch, error)
    );
  };
};

//Function will be used to load a list of reviews in a batch
//and will store all loaded reviews in the local firebase cache.
export const fetchReviews = (numReviewsToFetch, orderBy, path) => {
  return (dispatch, getState) => {
    dispatch({ type: FETCH_REVIEWS_REQUEST });

    fetchService.fetchReviews(numReviewsToFetch, orderBy, path).once(
      'value',
      snapshot => {
        const { users, user } = getState();

        const reviews = fetchService.generateReviewsFromFirebaseSnapshot(snapshot);
        reviews.forEach((data) => {
          const userId = data.userIdLastReviewCreatedTime.split('-')[0];
          
          data.isUserReview = false;
          if (user.uid === userId) {
            data.isUserReview = true;
            dispatch(fetchReviewExtensionByVisit(data.visitId));
          }

          if (users.byId.usersList[userId] === undefined || user.uid !== userId) {              
              dispatch(addUserToList(userId));
              dispatch(fetchUserProfilePicture(userId));
          }
        });
        fetchReviewsSuccess(dispatch, reviews);
      },
      error => {
        fetchReviewsError(dispatch, error);
      }
    );
  };
};


//Function will be used to load a list of reviews for specified user in a batch
//and will store all loaded reviews in the local firebase cache.
export const fetchUserReviews = userId => {
  if (!userId) {
    return;
  }

  return (dispatch, getState) => {
    dispatch(fetchUserReviewsRequest({ userId }));

    fetchService.fetchUserReviews(userId).once(
      'value',
      snapshot => {
        const { user } = getState();
        const { uid } = user;
        const reviews = fetchService.generateReviewsFromFirebaseSnapshot(snapshot);
        
        reviews.forEach(visit => {
          if (uid === userId) {
            const { visitId } = visit;
            dispatch(fetchReviewExtensionByVisit(visitId));
          }          
        });
        dispatch(fetchUserReviewsSuccess({ userId, reviews, uid }));
      },
      error => dispatch(fetchUserReviewsFailure({ userId, error }))
    );
  };
};

/**
 * Load the reviews that were posted since the most recent
 * review in the store.
 */
export const loadMostRecentReviews = () => {
  return (dispatch, getState) => {
    dispatch({ type: FETCH_REVIEWS_REQUEST });

    const { reviews } = getState();

    if (!reviews || reviews.reviewsIds.length === 0) {
      return;
    }
    const mostRecentReviewId = reviews.reviewsIds[0];
    const mostRecentReview = reviews[mostRecentReviewId];

    fetchReviewsStartingAt(mostRecentReview.createdTime, mostRecentReview.key)
      .then(newReviews => {
        const { user } = getState();
        newReviews.forEach(visit => {
          const userId = visit.userIdLastReviewCreatedTime.split('-')[0];
          visit.isUserReview = user.uid === userId;
        });
        addReviewsSuccess(dispatch, {
          reviews: newReviews,
          toLocation: 'front'
        });
      })
      .catch(error => fetchReviewsError(dispatch, error));
  };
};

/**
 * Request to load more reviews. This will start from the last loaded visit
 * and fetch x more visits
 */
export const loadMoreReviews = () => {
  return (dispatch, getState) => {
    dispatch({ type: FETCH_REVIEWS_REQUEST });

    const { visits } = getState();
    const lastVisitId = _.last(visits.visitIds);

    if (!lastVisitId) {
      return;
    }

    const lastReviewCreatedTime = visits[lastVisitId].lastReviewCreatedTime;

    fetchReviewsEndingAt(lastReviewCreatedTime, lastVisitId)
      .then(newReviews => {
        newReviews.forEach((review) => {
          const userId = review.userIdLastReviewCreatedTime.split('-')[0];
          const { users, user } = getState();

          review.isUserReview = false;
          if (user.uid === userId) {
            review.isUserReview = true;
            dispatch(fetchReviewExtensionByVisit(review.visitId));
          }
          
          if (users.byId.usersList[userId] === undefined || user.uid !== userId) {
              dispatch(addUserToList(userId));
              dispatch(fetchUserProfilePicture(userId));
          }
        });
        addReviewsSuccess(dispatch, { reviews: newReviews, toLocation: 'back' });
      })
      .catch(error => fetchReviewsError(dispatch, error));
  };
};

export const loadMoreUserReviews = userId => {
  return (dispatch, getState) => {
    dispatch(addUserReviewsRequest({ userId }));

    const { user, visits } = getState();
    const userVisits = visits.userVisitIds[userId];
    const lastVisitId = _.last(userVisits);

    if (!lastVisitId) {
      return;
    }

    const userIdLastReviewCreatedTime = visits[lastVisitId].userIdLastReviewCreatedTime;

    fetchUserReviewsEndingAt(userId, userIdLastReviewCreatedTime)
      .then(newReviews => {        
        const { uid } = user;

        newReviews.forEach(visit => {  
          if (uid === userId) {
            const { visitId } = visit;
            dispatch(fetchReviewExtensionByVisit(visitId));
          }          
        });

        dispatch(
          addUserReviewsSuccess({
            limit: fetchService.DEFAULT_REVIEWS_LIMIT,
            userId,
            reviews: newReviews,
            toLocation: 'back',
            uid
          })
        );
      })
      .catch(error => dispatch(addUserReviewsFailure({ userId, error })));
  };
};

const fetchUserReviewsEndingAt = (userId, userIdLastReviewCreatedTime) => {
  return new Promise((resolve, reject) => {
    fetchService.fetchUserReviewsEndingAt(userId, userIdLastReviewCreatedTime).once(
      'value',
      snapshot => {
        const revs = fetchService.generateReviewsFromFirebaseSnapshot(snapshot);
        const firstRev = _.first(revs);
        if (firstRev.userIdLastReviewCreatedTime === userIdLastReviewCreatedTime) {
          revs.shift(); //Remove first item
        }
        resolve(revs);
      },
      error => reject(error)
    );
  });
};

const fetchReviewsEndingAt = (reviewCreatedTime, reviewKey) => {
  return new Promise((resolve, reject) => {
    fetchService.fetchReviewsEndingAt(reviewCreatedTime, reviewKey).once(
      'value',
      snapshot => {
        const revs = fetchService.generateReviewsFromFirebaseSnapshot(snapshot);
        const firstRev = _.first(revs);
        if (
          firstRev.visitId === reviewKey &&
          firstRev.lastReviewCreatedTime === reviewCreatedTime
        ) {
          revs.shift(); //Remove first item
        }
        resolve(revs);
      },
      error => reject(error)
    );
  });
  //Add one to the numReviewsToFetch since we need to remove the first
  //item in the new array (because we already have it)
};

export const fetchMostRecentUserReviews = userId => {
  return (dispatch, getState) => {
    const { visits } = getState();
    const userVisitIds = visits.userVisitIds[userId];

    if (userVisitIds.length === 0) {
      dispatch(fetchUserReviews(userId));
      return;
    }

    dispatch(addUserReviewsRequest({ userId }));

    const mostRecentVisitId = _.first(userVisitIds);
    const userIdLastReviewCreatedTime = visits[mostRecentVisitId].userIdLastReviewCreatedTime;

    fetchUserReviewsStartingAt(userId, userIdLastReviewCreatedTime)
      .then(newReviews => {
        dispatch(
          addUserReviewsSuccess({
            userId,
            reviews: newReviews,
            toLocation: 'front'
          })
        );
      })
      .catch(error => {
        fetchReviewsError(dispatch, error);
      });
  };
};

/**
 *
 * @param {string} reviewCreatedTime
 * @param {string} reviewKey
 * @returns {Promise<Array<Reviews>>}
 */
const fetchReviewsStartingAt = (reviewCreatedTime, reviewKey) => {
  return new Promise((resolve, reject) => {
    fetchService.fetchReviewsStartingAt(reviewCreatedTime, reviewKey).once(
      'value',
      snapshot => {
        let newReviews = fetchService.generateReviewsFromFirebaseSnapshot(snapshot);
        newReviews = newReviews.slice(0, newReviews.length - 1);
        resolve(newReviews);
      },
      error => reject(error)
    );
  });
};

/**
 *
 * @param {string} reviewCreatedTime
 * @param {string} reviewKey
 * @returns {Promise<Array<Reviews>>}
 */
const fetchUserReviewsStartingAt = (userId, userIdLastReviewCreatedTime) => {
  return new Promise((resolve, reject) => {
    fetchService.fetchUserReviewsStartingAt(userId, userIdLastReviewCreatedTime).once(
      'value',
      snapshot => {
        let newReviews = fetchService.generateReviewsFromFirebaseSnapshot(snapshot);
        newReviews = newReviews.slice(0, newReviews.length - 1);
        resolve(newReviews);
      },
      error => reject(error)
    );
  });
};

export const fetchReviewExtension = () => {
  return (dispatch, getState) => {
    dispatch({ type: FETCH_REVIEW_EXTENSION_REQUEST });

    const { reviews } = getState();
    const reviewIds = reviews.reviewsIds;

    if (!reviews || reviewIds.length === 0) {
      return;
    }

    const oldestReviewId = reviews.oldestReview.reviewId;
    const latestReviewId = reviews.newestReview.reviewId;

    const reviewExtensions = [];
    fetchService.fetchReviewExtension(oldestReviewId, latestReviewId).once('value', snapshot => {
      snapshot.forEach(data => {
        const reviewId = data.key;
        const extn = data.val();
        Object.assign(extn, { reviewId });
        reviewExtensions.push(extn);
      });
      dispatch({ type: FETCH_REVIEW_EXTENSION_SUCCESS, payload: reviewExtensions });
    });
  };
};

export const fetchReviewExtensionByVisit = (visitId, reviewId) => {
  return (dispatch, getState) => {
    dispatch({ type: FETCH_REVIEW_EXTENSION_BY_VISIT_REQUEST });

    fetchService.fetchReviewExtensionByVisit(visitId, reviewId)
    .then((result) => {
      const { user } = getState();
      
      if (result) {
        dispatch(fetchReviewExtensionByVisitSuccess({
          uid: user.uid,
          visitId,
          reviews: reviewId ? { [reviewId]: result } : result
        }));
      }
    })
    .catch(() => {
      dispatch({ type: FETCH_REVIEW_EXTENSION_BY_VISIT_FAILURE });
    });
  };
};

export const filterBusinessReviews = (payload) => {
  return (dispatch, getState) => {
    const { businessReviews } = getState();

    dispatch({
      type: FILTER_BUSINESS_REVIEWS,
      payload: { ...payload, businessReviews }
    });
  };
};

export const selectVisit = (payload) => {
  return {
    type: VISIT_SELELCT,
    payload
  };
};

const fetchUserReviewsRequest = payload => {
  return {
    type: FETCH_USER_REVIEWS_REQUEST,
    payload
  };
};

const fetchUserReviewsSuccess = payload => {
  return {
    type: FETCH_USER_REVIEWS_SUCCESS,
    payload
  };
};

const fetchUserReviewsFailure = payload => {
  return {
    type: FETCH_USER_REVIEWS_FAILURE,
    payload
  };
};

const addUserReviewsRequest = payload => {
  return {
    type: ADD_USER_REVIEWS_REQUEST,
    payload
  };
};

const addUserReviewsSuccess = payload => {
  return {
    type: ADD_USER_REVIEWS_SUCCESS,
    payload
  };
};

const addUserReviewsFailure = payload => {
  return {
    type: ADD_USER_REVIEWS_FAILURE,
    payload
  };
};

const fetchReviewExtensionByVisitSuccess = payload => {
  return {
    type: FETCH_REVIEW_EXTENSION_BY_VISIT_SUCCESS,
    payload
  };
};

/**
 *
 * @param {Object} dispatch
 * @param {Object} payload An object of the form { reviews, toLocation }
 *                 toLocation can be either 'back' or 'front'
 */
const addReviewsSuccess = (dispatch, payload) => {
  dispatch({
    type: ADD_REVIEWS_SUCCESS,
    payload
  });
};

const fetchReviewsSuccess = (dispatch, payload) => {
  dispatch({
    type: FETCH_REVIEWS_SUCCESS,
    payload
  });
};

const fetchReviewsError = (dispatch, error) => {
  dispatch({
    type: FETCH_REVIEWS_ERROR,
    payload: error
  });
};

export const deleteReview = (reviewId, businessCategory) => {
  const path = getBusinessReviewPathForId(reviewId, businessCategory);
  DBService.getDatabaseReferenceByPath(path)
    .child(reviewId)
    .remove();
};

const getReviewPathForId = id => {
  if (id) {
    return `${REVIEWS_PATH}/${id}`;
  }
  return `${REVIEWS_PATH}`;
};

const getUserReviewPathForId = id => {
  if (id) {
    return `${USER_REVIEWS_PATH}/${id}`;
  }
  return `${USER_REVIEWS_PATH}`;
};

const getBusinessReviewPathForId = (id, category) => {
  if (id) {
    return `${BUSINESS_REVIEWS_PATH}/${category}/${id}`;
  }
  return `${BUSINESS_REVIEWS_PATH}/${category}`;
};

const getReviewExtensionPathForId = (path, id, visitId) => {
  return visitId ? `${path}/${visitId}/${id}` : `${path}/${id}`;
};

const getBusinessPathForId = (id, category) => {
  if (id) {
    return `${BUSINESS_ROOT_PATH}/${category}/${id}`;
  }
  return `${BUSINESS_ROOT_PATH}/${category}`;
};

const getBusinessRecommendsPathForId = (id, category) => {
  if (id) {
    return `${BUSINESS_RECOMMENDATIONS_PATH}/${category}/${id}`;
  }
  return `${BUSINESS_RECOMMENDATIONS_PATH}/${category}`;
};

const getBusinessApiPathForId = id => {
  if (id) {
    return `${BUSINESS_BY_API_ROOT_PATH}/${id}`;
  }
  return `${BUSINESS_BY_API_ROOT_PATH}`;
};

const generateReviewStatements = (
  businessId,
  businessCategory,
  visitId,
  reviewId,
  userId,
  reviewContent
) => {
  const { createdTime } = reviewContent;
  Object.assign(reviewContent, { visitId });

  const userReviewPath = getUserReviewPathForId(`${userId}/${businessId}`);
  const reviewPath = getReviewPathForId();
  const businessReviewPath = getBusinessReviewPathForId(businessId, businessCategory);

  const updates = {
    [`${userReviewPath}/${visitId}/lastReviewCreatedTime`]: createdTime,
    [`${userReviewPath}/${visitId}/userIdLastReviewCreatedTime`]: `${userId}-${createdTime}`,
    [`${userReviewPath}/${visitId}/${reviewId}`]: reviewContent,

    [`${reviewPath}/${visitId}/lastReviewCreatedTime`]: createdTime,
    [`${reviewPath}/${visitId}/userIdLastReviewCreatedTime`]: `${userId}-${createdTime}`,
    [`${reviewPath}/${visitId}/${reviewId}`]: reviewContent,

    [`${businessReviewPath}/${visitId}/lastReviewCreatedTime`]: createdTime,
    [`${businessReviewPath}/${visitId}/userIdLastReviewCreatedTime`]: `${userId}-${createdTime}`,
    [`${businessReviewPath}/${visitId}/${reviewId}`]: reviewContent
  };

  return DBService.updateGroup(updates).then(() => { });
};

const getVisitIdForReview = (userId, businessId) => {
  return new Promise((resolve, reject) => {
    //Has the user already shot other reviews during this current visit?
    //If yes, return the visitId, if no, create a new visitId for this review.
    reviewService
      .getVisitId(getUserReviewPathForId(`${userId}/${businessId}`))
      .then(visitId => {
        if (visitId) {
          //User already shot a review for the current visit
          resolve({
            isExisting: true,
            visitId
          });
        } else {
          //No reviews exist for the current visit, so create a new visitId
          visitId = DBService.getDatabaseStorageIdByPath(
            getUserReviewPathForId(`${userId}/${businessId}`)
          );
          resolve({
            isExisting: false,
            visitId
          });
        }
      })
      .catch(error => {
        //create new visitId?
        reject(error);
      });
  });
};

const saveReview = reviewContent => {
  const { businessId, userId, businessCategory } = reviewContent;
  return getVisitIdForReview(userId, businessId).then(({ isExisting, visitId }) => {
    const reviewId = DBService.getDatabaseStorageId();
    Object.assign(reviewContent, { reviewId });

    const { createdTime } = reviewContent;
    const userIdCreatedTime = `${userId}_${createdTime}`;
    Object.assign(reviewContent, { userIdCreatedTime });

    const statements = [];

    const reviewStatements = generateReviewStatements(
      businessId,
      businessCategory,
      visitId,
      reviewId,
      userId,
      reviewContent
    );
    statements.push(reviewStatements);

    const reviewExtension = generateReviewExtension(reviewContent);
    statements.push(reviewExtension);

    reviewContent = { ...reviewContent, visitId, isExistingVisit: isExisting };

    return Promise.all(statements)
    .then(() => reviewContent);
  });
};

const generateReviewExtension = reviewContent => {
  const extensionStatements = [];
  const { reviewId, numLikes, numViews } = reviewContent;
  const reviewExtensionContent = { numLikes, numViews };

  const reviewExtensionPath = getReviewExtensionPathForId(REVIEWS_EXTENSION_PATH, reviewId);
  extensionStatements.push(save(reviewExtensionContent, reviewExtensionPath));

  return extensionStatements;
};

const getThumbnail = (uri, mediaType) => {
  return mediaOperations.createThumbnail(uri, mediaType);
};

export const saveViewAction = reviewObject => {
  return (dispatch, getState) => {
    const { user } = getState();
    const { userId: reviewerId, reviewId } = reviewObject;

    if (user.uid === reviewerId) {
      updateViewsInternal(
        reviewObject,
        { ...getUpdateViewsExtensionUpdates(reviewObject) },
        dispatch
      );
      return;
    }

    // Note: We only update numViews after verifying it's not the user's
    // own review
    reviewObject.numViews += 1;
    const reviewExtensionPath = getReviewExtensionPathForId(REVIEWS_EXTENSION_PATH, reviewId);

    reviewService.incrementViews(reviewExtensionPath).then(res => {
      if (res.committed === true) {
        committedViews = res.snapshot.val();
        Object.assign(reviewObject, { numViews: committedViews });
        updateViewsInternal(
          reviewObject,
          {
            ...getUpdateViewsReviewUpdates(reviewObject),
            ...getUpdateViewsExtensionUpdates(reviewObject)
          },
          dispatch
        );
      }
    });
  };
};

export const saveLikeAction = reviewObject => {
  return (dispatch, getState) => {
    const { reviewId, likeStatus, numLikes } = reviewObject;

    reviewObject.numLikes = likeStatus === true ? numLikes + 1 : numLikes < 1 ? 0 : numLikes - 1;
    const reviewExtensionPath = getReviewExtensionPathForId(REVIEWS_EXTENSION_PATH, reviewId);

    if (likeStatus === true) {
      reviewService.incrementLikes(reviewExtensionPath).then(res => {
        if (res.committed === true) {
          committedLikes = res.snapshot.val();
          Object.assign(reviewObject, { numLikes: committedLikes });
          updateLikesInternal(reviewObject, dispatch);
        }
      });
    } else {
      reviewService.decrementLikes(reviewExtensionPath).then(res => {
        if (res.committed === true) {
          committedLikes = res.snapshot.val();
          updateLikesInternal(reviewObject, dispatch);
        }
      });
    }
  };
};

const getUpdateViewsReviewUpdates = reviewObject => {
  const {
    userId: reviewerId,
    visitId,
    reviewId,
    numViews,
    businessId,
    businessCategory
  } = reviewObject;

  let reviewPath = getReviewPathForId();
  reviewPath = `${reviewPath}/${visitId}/${reviewId}`;

  let businessReviewPath = getBusinessReviewPathForId(businessId, businessCategory);
  businessReviewPath = `${businessReviewPath}/${visitId}/${reviewId}`;

  let userReviewPath = getUserReviewPathForId(`${reviewerId}/${businessId}`);
  userReviewPath = `${userReviewPath}/${visitId}/${reviewId}`;

  return {
    [`${businessReviewPath}/numViews`]: numViews,
    [`${userReviewPath}/numViews`]: numViews,
    [`${reviewPath}/numViews`]: numViews
  };
};

const getUpdateViewsExtensionUpdates = reviewObject => {
  const { reviewId, visitId } = reviewObject;

  const viewerId = (authService.getCurrentUser() || {}).uid;
  const currentTime = moment.utc().format();

  let reviewExtensionByViewerPath = getReviewExtensionPathForId(
    REVIEWS_EXTENSION_BY_VIEWER_PATH,
    viewerId,
    visitId
  );
  reviewExtensionByViewerPath = `${reviewExtensionByViewerPath}/${reviewId}`;
  
  let reviewExtensionByReviewPath = getReviewExtensionPathForId(
    REVIEWS_EXTENSION_BY_REVIEW_PATH,
    reviewId,
    visitId
  );
  reviewExtensionByReviewPath = `${reviewExtensionByReviewPath}/${viewerId}`;

  const viewedStatus = true; //if this function is called, it means reviewed has been viewed.
  return {
    [`${reviewExtensionByViewerPath}/viewed`]: viewedStatus,
    [`${reviewExtensionByViewerPath}/updatedTime`]: currentTime,

    [`${reviewExtensionByReviewPath}/viewed`]: viewedStatus,
    [`${reviewExtensionByReviewPath}/updatedTime`]: currentTime
  };
};

const updateViewsInternal = (reviewObject, updates, dispatch) => {
  const { visitId, reviewId, numViews, businessId, businessCategory } = reviewObject;

  return DBService.updateGroup(updates).then(() => {
    dispatch(
      updateViews({
        reviewId,
        businessId,
        businessCategory,
        viewedStatus: true,
        visitId,
        numViews
      })
    );
  });
};

const updateLikesInternal = (reviewObject, dispatch) => {
  const {
    userId: reviewerId,
    visitId,
    reviewId,
    numLikes,
    likeStatus,
    businessId,
    businessCategory
  } = reviewObject;

  let reviewPath = getReviewPathForId();
  reviewPath = `${reviewPath}/${visitId}/${reviewId}`;

  let businessReviewPath = getBusinessReviewPathForId(businessId, businessCategory);
  businessReviewPath = `${businessReviewPath}/${visitId}/${reviewId}`;

  let userReviewPath = getUserReviewPathForId(`${reviewerId}/${businessId}`);
  userReviewPath = `${userReviewPath}/${visitId}/${reviewId}`;

  //ReviewExtensionByViewer
  const viewerId = authService.getCurrentUser().uid;
  const currentTime = moment.utc().format();

  let reviewExtensionByViewerPath = getReviewExtensionPathForId(
    REVIEWS_EXTENSION_BY_VIEWER_PATH,
    viewerId,
    visitId
  );
  reviewExtensionByViewerPath = `${reviewExtensionByViewerPath}/${reviewId}`;

  let reviewExtensionByReviewPath = getReviewExtensionPathForId(
    REVIEWS_EXTENSION_BY_REVIEW_PATH,
    reviewId,
    visitId
  );
  reviewExtensionByReviewPath = `${reviewExtensionByReviewPath}/${viewerId}`;

  const updates = {
    [`${businessReviewPath}/numLikes`]: numLikes,
    [`${userReviewPath}/numLikes`]: numLikes,
    [`${reviewPath}/numLikes`]: numLikes,

    [`${reviewExtensionByViewerPath}/liked`]: likeStatus,
    [`${reviewExtensionByViewerPath}/updatedTime`]: currentTime,

    [`${reviewExtensionByReviewPath}/liked`]: likeStatus,
    [`${reviewExtensionByReviewPath}/updatedTime`]: currentTime
  };

  return DBService.updateGroup(updates).then(() => {
    dispatch(
      updateLikes({
        reviewId,
        businessId,
        businessCategory,
        likeStatus,
        numLikes
      })
    );
  });
};

const getMomentDetails = moment => {
  return new Promise((resolve, reject) => {
    const promises = [];
    const { uri, mediaType, business, text, name, textStyles, userId } = moment;

    business.userId = userId;
    promises.push(getThumbnail(uri, mediaType));
    promises.push(getBusinessId(business));

    Promise.all(promises)
      .then(attr => {
        const momentDetails = {
          mediaType,
          text,
          thumbnail: attr[0],
          businessId: attr[1],
          businessLocation: business.location,
          businessName: business.name,
          moment: name,
          textStyles
        };
        resolve(momentDetails);
      })
      .catch(error => {
        reject(error);
      });
  });
};

const getUserDetails = user => {
  const { firstName, lastName, uid } = user;
  const userDetails = {
    userId: uid,
    userName: `${firstName} ${lastName}`
  };
  return userDetails;
};

//TODO - change the input param back to moment and fix moment.js import
const generateReviewContent = (user, moments, uri) => {
  return new Promise((resolve, reject) => {
    const numLikes = 0;
    const numViews = 0;
    const currentTime = moment.utc().format();
    const businessCategory = moments.business.businessCategory;
    const neighborhood = moments.business.neighborhood;

    const reviewContent = {
      numLikes,
      numViews,
      createdTime: currentTime,
      mediaPath: uri,
      businessCategory,
      neighborhood
    };

    const userDetails = getUserDetails(user);
    Object.assign(reviewContent, userDetails);

    moments.userId = user.uid;
    getMomentDetails(moments)
      .then(momentDetails => {
        Object.assign(reviewContent, momentDetails);
        resolve(reviewContent);
      })
      .catch(error => {
        reject(error);
      });
  });
};

const applyRecommendation = (
  userId,
  businessId,
  businessCategory,
  previousRecommendations,
  newRecommendation,
  momentName
) => {
  return new Promise((resolve, reject) => {
    const promises = [];

    if (!previousRecommendations) {
      promises.push(
        addBusinessRecommendation(businessId, businessCategory, newRecommendation, momentName)
      );
    } else if (!previousRecommendations[momentName]) {
      promises.push(
        addBusinessMomentRecommendation(businessId, businessCategory, newRecommendation, momentName)
      );
    }

    if (previousRecommendations && previousRecommendations[momentName] !== newRecommendation) {
      promises.push(
        updateBusinessRecommendation(
          businessId,
          businessCategory,
          previousRecommendations,
          newRecommendation,
          momentName
        )
      );
    }

    const changeInNumOfRecommends = getChangeInNumOfRecommends(
      previousRecommendations,
      newRecommendation,
      momentName
    );

    if (changeInNumOfRecommends === -1) {
      promises.push(userService.decrementAggregateRecommends(userId));
    } else if (changeInNumOfRecommends === 1) {
      promises.push(userService.incrementAggregateRecommends(userId));
    }

    Promise.all(promises)
      .then(() => {
        if (!previousRecommendations || previousRecommendations[momentName] !== newRecommendation) {
          recommendationService
            .setRecommendation(userId, businessId, businessCategory, momentName, newRecommendation)
            .then(() => {
              resolve();
            })
            .catch(error => {
              reject(error);
            });
        } else {
          resolve();
        }
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const createReview = recommendation => {
  return (dispatch, getState) => {
    const { user, moment } = getState();
    let businessId;
    let businessCategory;
    let reviewContent;
    let previousRecommendations;

    const newRecommendation = recommendation || false;
    const userId = user.uid;

    dispatch(createReviewRequest({}));
    const uri = moment.filterName ? moment.filteredUri : moment.uri;
    return mediaService
      .uploadMedia(uri, moment.mediaType)
      .then(response => {
        return generateReviewContent(user, moment, response.downloadURL);
      })
      .then(content => {
        reviewContent = content;
        businessId = reviewContent.businessId;
        businessCategory = reviewContent.businessCategory;
        return saveReview(reviewContent);
      })
      .then((content) => {
        reviewContent = content;
        previousRecommendations = user.recommendations[businessId] || null;
        return applyRecommendation(
          userId,
          businessId,
          businessCategory,
          previousRecommendations,
          newRecommendation,
          moment.name
        );
      })
      .then(() => {
        const { isExistingVisit } = reviewContent;
        return userService.incrementAggregateReviews(userId, isExistingVisit);
      })
      .then(() => {
        dispatch(
          setBusinessUserRecommendationSuccess({
            userId,
            businessId,
            businessName: moment.business.name,
            moment: moment.name,
            newRecommendation
          })
        );
        dispatch(createReviewSuccess({ ...reviewContent, businessName: moment.business.name }));
        if (moment.filterName) {
          mediaService.deleteMediaAtLocalPath(moment.filteredUri);
          dispatch(momentFilterCleared());
        }
        mediaService.deleteMediaAtLocalPath(moment.uri);
      })
      .catch(error => {
        dispatch(createReviewFailure(error));
      });
  };
};

const save = (reviewContent, reviewPath) => {
  return DBService.updateData(reviewContent, reviewPath)
    .then(() => {
      return;
    })
    .catch(error => {
      return error;
    });
};

const addBusinessRecommendation = (
  businessId,
  businessCategory,
  recommendation,
  recommendationMoment
) => {
  let numOfRecommendations;
  let numOfRecommends;
  let percentRecommend;

  let numOfMomentRecommendations;
  let numOfMomentRecommends;
  let percentMomentRecommend;

  const path = getBusinessRecommendsPathForId(businessId, businessCategory);
  const businessPath = getBusinessPathForId(businessId, businessCategory);

  DBService.getDatabaseReferenceByPath(path)
    .once('value')
    .then(snapshot => {
      const snapshotVal = snapshot.val();
      numOfRecommendations = snapshotVal ? snapshotVal.numOfRecommendations + 1 : 1;
      numOfMomentRecommendations =
        snapshotVal && snapshotVal[moment] ? snapshotVal[moment].numOfRecommendations + 1 : 1;

      if (snapshotVal) {
        numOfRecommends = recommendation
          ? snapshotVal.numOfRecommends + 1
          : snapshotVal.numOfRecommends;

        if (snapshotVal[moment]) {
          numOfMomentRecommends = recommendation
            ? snapshotVal[moment].numOfRecommends + 1
            : snapshotVal[moment].numOfRecommends;
        } else {
          numOfMomentRecommends = recommendation ? 1 : 0;
        }
      } else {
        numOfRecommends = recommendation ? 1 : 0;
        numOfMomentRecommends = recommendation ? 1 : 0;
      }

      percentRecommend = numOfRecommends / numOfRecommendations;
      percentMomentRecommend = numOfMomentRecommends / numOfMomentRecommendations;
      const currentTime = moment.utc().format();

      const updates = {
        [`${path}/businessId`]: businessId,
        [`${path}/numOfRecommendations`]: numOfRecommendations,
        [`${path}/numOfRecommends`]: numOfRecommends,
        [`${path}/percentRecommend`]: percentRecommend,
        [`${path}/lastRecommended`]: currentTime,

        [`${businessPath}/numOfRecommendations`]: numOfRecommendations,
        [`${businessPath}/numOfRecommends`]: numOfRecommends,
        [`${businessPath}/percentRecommend`]: percentRecommend,
        [`${businessPath}/lastRecommended`]: currentTime,
        [`${businessPath}/percentRecommend`]: percentRecommend
      };

      const momentUpdates = getBusinessMomentRecommendationUpdates(
        path,
        businessPath,
        recommendationMoment,
        {
          numOfRecommendations: numOfMomentRecommendations,
          numOfRecommends: numOfMomentRecommends,
          percentRecommend: percentMomentRecommend,
          currentTime
        }
      );

      return DBService.updateGroup({
        ...updates,
        ...momentUpdates
      });
    });
};

const addBusinessMomentRecommendation = (
  businessId,
  businessCategory,
  recommendation,
  recommendationMoment
) => {
  let numOfRecommendations;
  let numOfRecommends;
  let percentRecommend;

  const path = getBusinessRecommendsPathForId(businessId, businessCategory);
  const businessPath = getBusinessPathForId(businessId, businessCategory);

  DBService.getDatabaseReferenceByPath(path)
    .once('value')
    .then(snapshot => {
      const snapshotVal = snapshot.val();
      numOfRecommendations =
        snapshotVal && snapshotVal[recommendationMoment]
          ? snapshotVal[recommendationMoment].numOfRecommendations + 1
          : 1;

      if (snapshotVal && snapshotVal[recommendationMoment]) {
        numOfRecommends = recommendation
          ? snapshotVal[recommendationMoment].numOfRecommends + 1
          : snapshotVal[recommendationMoment].numOfRecommends;
      } else {
        numOfRecommends = recommendation ? 1 : 0;
      }

      percentRecommend = numOfRecommends / numOfRecommendations;
      const currentTime = moment.utc().format();

      const updates = getBusinessMomentRecommendationUpdates(
        path,
        businessPath,
        recommendationMoment,
        {
          numOfRecommendations,
          numOfRecommends,
          percentRecommend,
          currentTime
        }
      );
      return DBService.updateGroup(updates);
    });
};

const getBusinessMomentRecommendationUpdates = (
  path,
  businessPath,
  recommendationMoment,
  summary
) => {
  const { numOfRecommendations, numOfRecommends, percentRecommend, currentTime } = summary;
  const updates = {
    [`${path}/${recommendationMoment}/numOfRecommendations`]: numOfRecommendations,
    [`${path}/${recommendationMoment}/numOfRecommends`]: numOfRecommends,
    [`${path}/${recommendationMoment}/percentRecommend`]: percentRecommend,
    [`${path}/${recommendationMoment}/lastRecommended`]: currentTime,

    [`${businessPath}/${recommendationMoment}/numOfRecommendations`]: numOfRecommendations,
    [`${businessPath}/${recommendationMoment}/numOfRecommends`]: numOfRecommends,
    [`${businessPath}/${recommendationMoment}/percentRecommend`]: percentRecommend,
    [`${businessPath}/${recommendationMoment}/lastRecommended`]: currentTime
  };

  return updates;
};

const updateBusinessRecommendation = (
  businessId,
  businessCategory,
  previousRecommendations,
  recommendation,
  momentName
) => {
  let numOfRecommends;
  let numOfMomentRecommends;
  let percentRecommend;
  let percentMomentRecommend;

  const numOfRecommendsDelta = getChangeInNumOfRecommends(
    previousRecommendations,
    recommendation,
    momentName
  );

  const path = getBusinessRecommendsPathForId(businessId, businessCategory);
  const businessPath = getBusinessPathForId(businessId, businessCategory);

  DBService.getDatabaseReferenceByPath(path)
    .once('value')
    .then(snapshot => {
      const snapshotVal = snapshot.val();

      numOfRecommends = snapshotVal.numOfRecommends + numOfRecommendsDelta;
      percentRecommend = numOfRecommends / snapshotVal.numOfRecommendations;
      const currentTime = moment.utc().format();

      const updates = {
        [`${path}/numOfRecommends`]: numOfRecommends,
        [`${path}/percentRecommend`]: percentRecommend,
        [`${path}/lastRecommended`]: currentTime,

        [`${businessPath}/numOfRecommends`]: numOfRecommends,
        [`${businessPath}/percentRecommend`]: percentRecommend,
        [`${businessPath}/lastRecommended`]: currentTime
      };
      let momentUpdates = {};

      // Note: If this is a new moment for this business and user, it will
      // have been added in a prior method
      if (snapshotVal[momentName]) {
        numOfMomentRecommends = recommendation
          ? snapshotVal[momentName].numOfRecommends + 1
          : snapshotVal[momentName].numOfRecommends - 1;
        percentMomentRecommend =
          numOfMomentRecommends / snapshotVal[momentName].numOfRecommendations;

        momentUpdates = getBusinessMomentRecommendationUpdates(path, businessPath, momentName, {
          numOfRecommendations: snapshotVal[momentName].numOfRecommendations,
          numOfRecommends: numOfMomentRecommends,
          percentRecommend: percentMomentRecommend,
          currentTime
        });
      }
      return DBService.updateGroup({
        ...updates,
        ...momentUpdates
      });
    });
};

const getChangeInNumOfRecommends = (previousRecommendations = {}, recommendation, momentName) => {
  const updatedRecommendations = {
    ...previousRecommendations,
    [momentName]: {
      recommend: recommendation
    }
  };

  if (
    hasAtLeastOneMomentRecommended(previousRecommendations) &&
    !hasAtLeastOneMomentRecommended(updatedRecommendations)
  ) {
    return -1;
  } else if (
    !hasAtLeastOneMomentRecommended(previousRecommendations) &&
    hasAtLeastOneMomentRecommended(updatedRecommendations)
  ) {
    return 1;
  }

  return 0;
};

const hasAtLeastOneMomentRecommended = recommendations => {
  if (!recommendations || Object.keys(recommendations).length === 0) {
    return false;
  }

  return Object.keys(recommendations).reduce((accumulator, currentVal) => {
    const result = accumulator || recommendations[currentVal].recommend;
    return result;
  }, false);
};

const getBusinessId = business => {
  return new Promise((resolve, reject) => {
    let businessId;
    const apiId = business.id;
    const path = getBusinessApiPathForId('');
    DBService.getDatabaseReferenceByPath(path)
      .orderByChild(API_ID)
      .equalTo(apiId)
      .once('value')
      .then(snapshot => {
        if (snapshot.val() !== null) {
          snapshot.forEach(data => {
            businessId = data.val().businessId;
          });
          resolve(businessId);
        } else {
          //Business does not yet exist, so create it and get the businessId
          businessService
            .createBusiness(business)
            .then(newBusiness => {
              businessId = newBusiness.businessId;
              resolve(businessId);
            })
            .catch(error => {
              reject(`Error occured while creating business.. -${error}`);
            });
        }
      })
      .catch(error => {
        reject(`Error occured while fetching business ID using Api.. - ${error}`);
      });
  });
};

const updateLikes = reviewDetails => {
  return {
    type: UPDATE_LIKES,
    payload: reviewDetails
  };
};

const updateViews = reviewDetails => {
  return {
    type: UPDATE_VIEWS,
    payload: reviewDetails
  };
};

const createReviewRequest = review => {
  return {
    type: CREATE_REVIEW_REQUEST,
    payload: review
  };
};

const createReviewSuccess = review => {
  return {
    type: CREATE_REVIEW_SUCCESS,
    payload: review
  };
};

const createReviewFailure = error => {
  return {
    type: CREATE_REVIEW_FAILURE,
    payload: error
  };
};

const setBusinessUserRecommendationSuccess = payload => {
  return {
    type: SET_BUSINESS_USER_RECOMMENDATION_SUCCESS,
    payload
  };
};

export const getAllRecommendations = () => {
  return dispatch => {
    fetchService.fetchAllRecommendations().on('value', snapshot => {
      dispatch({
        type: FETCH_RECOMMENDATIONS_BY_USERS,
        payload: snapshot.val()
      });
    });
  };
};

export const fetchRecommendations = () => {
  return (dispatch, getState) => {
    const { visits, reviews } = getState();
    const newVisitIds = (visits.newVisitIds) ? (visits.newVisitIds) : [];
    //TODO - for better performance, run this loop in a cloud function
    newVisitIds.forEach(visitId => {
      const visit = visits[visitId];
      const reviewId = visit.reviewIds[0]; //user and business on every review will be thesame
      const businessId = reviews[reviewId].businessId;
      const userId = reviews[reviewId].userId;

      fetchService.fetchRecommendation(businessId, userId).on('value', snapshot => {
        dispatch({
          type: FETCH_RECOMMENDATIONS_BY_USERS,
          payload: snapshot.val()
        });
      });
    });
  };
};
