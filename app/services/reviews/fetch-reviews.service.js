import firebase from 'react-native-firebase';
import {
  REVIEWS_PATH,
  REVIEWS_EXTENSION_BY_VIEWER_PATH,
  REVIEWS_EXTENSION_BY_REVIEW_PATH,
  REVIEWS_EXTENSION_PATH,
  RECOMMENDATIONS_BY_USER
} from '../../services/review/review-endpoints';

const QUERY_BY_VALUE = 'lastReviewCreatedTime';
const QUERY_BY_USER_VALUE = 'userIdLastReviewCreatedTime';
export const DEFAULT_REVIEWS_LIMIT = 5;

/**
 * Fetches a Views user's reviews
 * @param {String} userId - The id of the user to fetch reviews
 * @param {Integer} limit - The maximum number of reviews to fetch
 */
export const fetchUserReviews = (userId, orderBy = QUERY_BY_USER_VALUE, path = REVIEWS_PATH) => {
  const reviewsRef = firebase
    .database()
    .ref(path)
    .orderByChild(orderBy)
    .startAt(userId)
    .endAt(`${userId}\uf8ff`); //\uf8ff is similar to % in SQL, matches anything
  return reviewsRef.limitToLast(DEFAULT_REVIEWS_LIMIT);
};

export const fetchUserReviewsStartingAt = (
  userId,
  startingValue,
  orderBy = QUERY_BY_USER_VALUE,
  path = REVIEWS_PATH
) => {
  return firebase
    .database()
    .ref(path)
    .orderByChild(orderBy)
    .startAt(startingValue)
    .endAt(`${userId}\uf8ff`); //\uf8ff is similar to % in SQL, matches anything
};

export const fetchUserReviewsEndingAt = (
  userId,
  endingValue,
  limit = DEFAULT_REVIEWS_LIMIT,
  orderBy = QUERY_BY_USER_VALUE,
  path = REVIEWS_PATH
) => {
  return firebase
    .database()
    .ref(path)
    .orderByChild(orderBy)
    .startAt(userId)
    .endAt(endingValue)
    .limitToLast(limit);
};

/**
 * Fetch first [x] reviews.
 * Creates a real time stream, which must be turned off when app is not in use.
 * Turn off using `stopFetchingReviews`
 * @param {Integer} numReviewsToFetch [x]
 * @param {String} orderBy database key to order the query by (e.g. time created, user name)
 * @returns firebase stream
 * example call: fetchReviews.on('value', snapshot => {}, error => {});
 */
//TODO - This will have issues during migration if users with old app version keep writing to app/reviews.
//Function will try to fetch visits, but they will be reviews and this will cause a bunch of NPEs.
export const fetchReviews = (numReviewsToFetch, orderBy = QUERY_BY_VALUE, path = REVIEWS_PATH) => {
  return firebase
    .database()
    .ref(path)
    .orderByChild(orderBy)
    .limitToLast(numReviewsToFetch);
};

export const fetchReviewsStartingAt = (
  startingValue,
  revID,
  orderBy = QUERY_BY_VALUE,
  path = REVIEWS_PATH
) => {
  return firebase
    .database()
    .ref(path)
    .orderByChild(orderBy)
    .startAt(startingValue, revID);
};

export const fetchReviewsEndingAt = (
  endingValue,
  revID,
  limit = DEFAULT_REVIEWS_LIMIT,
  orderBy = QUERY_BY_VALUE,
  path = REVIEWS_PATH
) => {
  return firebase
    .database()
    .ref(path)
    .orderByChild(orderBy)
    .endAt(endingValue, revID)
    .limitToLast(limit);
};

/* Fetch the list of reviews previously viewed and/or liked by this user
 * specified by @param {String} userId.
 */
export const fetchUserReviewExtension = (userId, path = REVIEWS_EXTENSION_BY_VIEWER_PATH) => {
  return firebase.database().ref(`${path}/${userId}`);
};

/* Gets extension details for all reviews existing between IDS
 * startingValue and endingValue.
 * @param startingValue first ID to begin searching from (inclusive)
 * @param endingValue last ID to search until (inclusive)
 */
export const fetchReviewExtension = (startingValue, endingValue, path = REVIEWS_EXTENSION_PATH) => {
  return firebase
    .database()
    .ref(path)
    .orderByKey()
    .startAt(startingValue)
    .endAt(endingValue);
};

/**
 * 
 * @param {*} visitId 
 * @param {*} reviewId 
 */
export const fetchReviewExtensionByVisit = (visitId, reviewId = '') => {
  const path = `${REVIEWS_EXTENSION_BY_REVIEW_PATH}/${visitId}/${reviewId}`;

  return firebase
    .database()
    .ref(path)
    .once('value')
    .then(snapshot => {
      if (snapshot) {
        return snapshot.val();
      }
      return null;
    });
};

/**
 * Gets business names and recommendations for each review
 * then creates an array of reviews
 * @param {Object} snapshot
 * @returns Promise which resolves with array of review objects
 */
export const generateReviewsFromFirebaseSnapshot = snapshot => {
  const reviews = [];

  // Note: The data looks different coming from 'child_added' vs 'value'
  if (snapshot.key === 'Reviews') {
    snapshot.forEach(data => {
      const visitId = data.key;
      const visit = data.val();
      //unshift === insert at front
      //TODO - remove if check once migration of reviews into story format is
      //complete and all users have migrated onto new version of the app.
      if (visit.lastReviewCreatedTime) {
        reviews.unshift({ ...visit, visitId });
      }
    });
  } else {
    return [snapshot.val()];
  }

  return reviews;
};

/// TODO: optimize to check first if a business' coords/info were already calculated
// A business whose coords (and info) were already calculated should never have to
// recalculate them
export const generateReviewsFromBusinessesSnapshot = snapshot => {
  const reviews = [];
  snapshot.forEach(data => {
    const business = data.val();
    Object.keys(business).forEach(key => {
      const review = business[key];
      reviews.unshift(review);
    });
  });
  return reviews;
};

/**
 * Turn off realtime database features for given path
 * @param path
 */
export const stopFetchingReviews = (path = REVIEWS_PATH) => {
  firebase
    .database()
    .ref(path)
    .off();
};

export const fetchRecommendationsByUser = (userId) => {
  return firebase.database().ref(`${RECOMMENDATIONS_BY_USER}/${userId}`);
};

export const fetchAllRecommendations = (path = RECOMMENDATIONS_BY_USER) => {
  return firebase
    .database()
    .ref(path)
    .orderByKey();
};

export const fetchRecommendation = (businessId, userId, path = RECOMMENDATIONS_BY_USER) => {
  return firebase
    .database().ref(`${path}/${userId}/${businessId}`);
};
