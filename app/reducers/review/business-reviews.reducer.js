import _ from 'lodash';
import {
  FETCH_REVIEWS,
  DELETE_REVIEW,
  REVIEW_SELECTED,
  UPDATE_LIKES,
  UPDATE_VIEWS,
  FETCH_REVIEW_EXTENSION_SUCCESS,
  FILTER_BUSINESS_REVIEWS,
  FETCH_REVIEW_EXTENSION_BY_VISIT_SUCCESS
} from '../../types/review.types';
import { 
  FilterTypes, 
  FilterOrderTypes 
} from '../../types/filter.types';
import { getUpdatedReviewsFromReviewExtensionByVisit } from './reviews.reducer';

/**
 * This object represents the review objects indexed by review id which is used to hold the state of
 * user reviews loaded from the database. State object will be in the form below
 * {{reviewId: review1}, {reviewId: review2}, {reviewId: review3}, {...}, {...}}
 * To retrieve an array of enumerable properties, use Object.values(state).
 *
 * A review is of the form:
 *   apiId: '',
 *   businessId: '',
 *   currentTime: 0,
 *   mediaPath: '',
 *   mediaType: '',
 *   reviewId: '',
 *   reviewRating: 0,
 *   thumbnail: [],
 *   userId: '',
 *   userName: '',
 */
const initialState = {
  ids: [], 
  filterBy: FilterTypes.createdDate, 
  filterOrderBy: FilterOrderTypes.descending 
};

export default (state = initialState, action) => {
  switch (action.type) {
    case REVIEW_SELECTED: {
      const { businessId, index: selectedReviewIndex, reviewIds: selectedReviewIds } = action.payload;

      return { ...state, businessId, selectedReviewIndex, selectedReviewIds };
    }
    case FETCH_REVIEWS: {
      const ids = [...state.ids];
      const reviews = {};
      const newReviewList = [];

      const results = action.payload.reviews;
      results.forEach(visit => {
        Object.values(visit)
        .forEach(entry => {
          const reviewId = entry.reviewId;
          if (reviewId) {
            newReviewList.push(entry);
          }
        });
      });

      newReviewList.forEach((review) => {
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

      return { ...state, ids, ...reviews };
    }

    case FETCH_REVIEW_EXTENSION_BY_VISIT_SUCCESS: {
      const updatedReviews = getUpdatedReviewsFromReviewExtensionByVisit(state, action);
      return { ...state, ...updatedReviews };
    }

    case FILTER_BUSINESS_REVIEWS: 
      const { filter, filterOrder } = action.payload;

      if (!FilterTypes[filter]) { return state; }
      
      return { ...state, filterBy: filter };

    case DELETE_REVIEW:
      return _.omit(state, action.payload);
    case FETCH_REVIEW_EXTENSION_SUCCESS:
    const extensions = action.payload;
    const updatedExtensions = {};
    extensions.forEach((extension) => {
      const { reviewId, numLikes, numViews } = extension;
      updatedExtensions[reviewId] = { ...state[reviewId], numLikes, numViews };
    });
    return { ...state, ...updatedExtensions };
    case UPDATE_LIKES:
      const { reviewId, numLikes } = action.payload;
      const updatedLike = { [reviewId]: { ...state[reviewId], numLikes } };
      return { ...state, ...updatedLike };
    case UPDATE_VIEWS:
        const { reviewId: id, numViews } = action.payload;
        const updatedView = { [id]: { ...state[id], numViews } };
        return { ...state, ...updatedView };
    default:
      return state;
  }
};
