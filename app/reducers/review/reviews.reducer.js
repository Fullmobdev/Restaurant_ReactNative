import moment from 'moment';
import {
  FETCH_REVIEWS_SUCCESS,
  FETCH_REVIEWS_FOR_VISIT_ID,
  FETCH_USER_REVIEWS_SUCCESS,
  FETCH_REVIEW_EXTENSION_SUCCESS,
  ADD_REVIEWS_SUCCESS,
  ADD_USER_REVIEWS_SUCCESS,
  ADD_USER_REVIEWS_REQUEST,
  REVIEW_SELECTED,
  UPDATE_LIKES,
  UPDATE_VIEWS,
  FETCH_RECOMMENDATIONS_BY_USERS,
  ADD_INITIAL_LINK,
  FETCH_REVIEW_EXTENSION_BY_VISIT_SUCCESS
} from '../../types/review.types';

import { FETCH_BUSINESS_NEIGHBORHOOD_SUCCESS } from '../../types/business.types';

const INITIAL_STATE = { reviewsIds: [], ids: [], reviewsLoading: false, initialLink: '' };

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_INITIAL_LINK: {
      return { ...state, initialLink: action.payload };
    }
    case FETCH_REVIEWS_FOR_VISIT_ID: {
      return { ...state, linkReviews: action.payload };
    }
    case REVIEW_SELECTED: {
      const { index, reviewIds: selectedReviewIds } = action.payload;
      return { ...state, index, selectedReviewIds };
    }
    case FETCH_REVIEWS_SUCCESS: {
      const ids = [...state.ids];
      const reviews = {};
      const visits = action.payload;

      const newReviews = [];
      const newReviewsIds = [];

      let oldestReview = state.oldestReview ? state.oldestReview : null;
      let newestReview = state.newestReview ? state.newestReview : null;

      visits.forEach(visit => {
        const visitId = visit.visitId;
        const isUserReview = visit.isUserReview;
        Object.values(visit).forEach(entry => {
          const reviewId = entry.reviewId;
          if (reviewId) {
            Object.assign(entry, { visitId, isUserReview });
            newReviews.push(entry);
            newReviewsIds.push(reviewId);

            if (oldestReview === null || newestReview === null) {
              oldestReview = newestReview = entry;
            }
            //Keep record of oldest and newest review to faciliate firebase bulk queries
            if (moment(entry.createdTime).isBefore(moment(oldestReview.createdTime))) {
              oldestReview = entry;
            } else if (moment(entry.createdTime).isAfter(moment(newestReview.createdTime))) {
              newestReview = entry;
            }
          }
        });
      });

      newReviews.forEach(review => {
        const reviewId = review.reviewId;
        const existingReview = state[reviewId];
        if (existingReview) {
          const updatedReview = { ...existingReview, ...review }; //new review from firbase wins
          reviews[reviewId] = updatedReview;
        } else {
          ids.push(reviewId);
          reviews[reviewId] = review;
        }
      });

      return { ...state, ids, ...reviews, reviewsIds: newReviewsIds, oldestReview, newestReview };
    }
    case ADD_REVIEWS_SUCCESS: {
      const toLocation = action.payload.toLocation;
      const visits = action.payload.reviews;

      if (!visits) {
        return state;
      }

      const newReviewsMap = {};
      let updatedReviewsIds = [];
      let {
        oldestReview: addedReviewsOldestReview,
        newestReview: addedReviewsNewestReview
      } = state;
      
      visits.forEach(visit => {
        Object.values(visit).forEach(entry => {
          const reviewId = entry.reviewId;
          entry.isUserReview = visit.isUserReview || false;
          if (reviewId && !state.reviewsIds.includes(reviewId)) {
            updatedReviewsIds.push(reviewId);
            newReviewsMap[reviewId] = entry;

            if (moment(entry.createdTime).isBefore(moment((addedReviewsOldestReview || {}).createdTime))) {
              addedReviewsOldestReview = entry;
            } else if (
              moment(entry.createdTime).isAfter(moment((addedReviewsNewestReview || {}).createdTime))
            ) {
              addedReviewsNewestReview = entry;
            }
          }
        });
      });

      if (toLocation === 'front') {
        updatedReviewsIds = updatedReviewsIds.concat(state.reviewsIds);
      } else {
        updatedReviewsIds = state.reviewsIds.concat(updatedReviewsIds);
      }
      
      const newState = {
        ...state,
        reviewsIds: updatedReviewsIds,
        ...newReviewsMap,
        newestReview: addedReviewsNewestReview,
        oldestReview: addedReviewsOldestReview
      };

      return newState;
    }
    case FETCH_USER_REVIEWS_SUCCESS: { //TODO - need to have these reviews sorted somehow and need to check for front/back
      const { reviews: visits, uid, userId } = action.payload;
      const isUserReview = uid === userId;
      return { ...state, ...getUserReviewsMap(visits, isUserReview) };
    }

    case ADD_USER_REVIEWS_REQUEST:
      return { ...state, reviewsLoading: true };

    case ADD_USER_REVIEWS_SUCCESS: { //TODO - need to have these reviews sorted somehow and need to check for front/back
      const { reviews: visits, uid, userId } = action.payload;
      const isUserReview = uid === userId;

      return { ...state, ...getUserReviewsMap(visits, isUserReview), reviewsLoading: false };
    }

    case FETCH_REVIEW_EXTENSION_SUCCESS:
      const extensions = action.payload;
      const updatedExtensions = {};
      extensions.forEach(extension => {
        const { reviewId, numLikes, numViews } = extension;
        updatedExtensions[reviewId] = { ...state[reviewId], numLikes, numViews };
      });
      return { ...state, ...updatedExtensions };

    case FETCH_REVIEW_EXTENSION_BY_VISIT_SUCCESS: {      
      const updatedReviews = getUpdatedReviewsFromReviewExtensionByVisit(state, action);
      return { ...state, ...updatedReviews };
    }

    case UPDATE_LIKES:
      const { reviewId, numLikes } = action.payload;
      const updatedLike = { [reviewId]: { ...state[reviewId], numLikes } };
      return { ...state, ...updatedLike };
    case UPDATE_VIEWS:
      const { reviewId: id, numViews } = action.payload;
      const updatedView = { [id]: { ...state[id], numViews } };
      return { ...state, ...updatedView };
    case FETCH_RECOMMENDATIONS_BY_USERS:
      const newState = {
        ...state,
        recommendations: action.payload
      };
      return newState;

    case FETCH_BUSINESS_NEIGHBORHOOD_SUCCESS:
      const { neighborhood, reviewId: neighborhoodSuccessReviewId } = action.payload;

      const updatedReview = { ...state[neighborhoodSuccessReviewId], neighborhood };

      return { ...state, [neighborhoodSuccessReviewId]: updatedReview };

    default:
      return state;
  }
};

export const getUpdatedReviewsFromReviewExtensionByVisit = (state, action) => {
  const { reviews, uid } = action.payload;
  const updatedReviews = {};
  

  Object.keys(reviews).forEach(reviewId => {
    const likesUserIds = [];
    const viewsUserIds = [];
    const reviewExtension = reviews[reviewId];

    Object.keys(reviewExtension).forEach(userId => {
      const userAction = reviewExtension[userId];
      if (userAction.liked) {
        likesUserIds.push(userId);
      }
      // Note: Currently the standard is that user's cannot 
      // view their own reviews
      if (userAction.viewed && userId !== uid) {
        viewsUserIds.push(userId);
      }
    });
    
    const currentReview = state[reviewId] || {};
    updatedReviews[reviewId] = {
      ...currentReview,
      likesUserIds,
      viewsUserIds
    };
  });

  return updatedReviews;
};

const getUserReviewsMap = (visits, isUserReview = false) => {
  const newUserReviewsMap = {};
  visits.forEach(visit => {
    Object.values(visit).forEach(entry => {
      const reviewId = entry.reviewId;
      if (reviewId) {
        entry.isUserReview = isUserReview;
        newUserReviewsMap[reviewId] = entry;
      }
    });
  });
  return newUserReviewsMap;
};
