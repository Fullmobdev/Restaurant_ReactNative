import {
  REVIEW_BUSINESS_TEXT_ADDED,
  REVIEW_BUSINESS_SELECTED,
  REVIEW_BUSINESS_RATED
} from '../../types/review-business.types';

export const addReviewBusinessText = (text, textStyles) => {
  return {
    type: REVIEW_BUSINESS_TEXT_ADDED,
    payload: { text, textStyles }
  };
};

export const selectReviewBusiness = business => {
  return {
    type: REVIEW_BUSINESS_SELECTED,
    payload: business
  };
};

export const rateReviewBusiness = rating => {
  return {
    type: REVIEW_BUSINESS_RATED,
    payload: rating
  };
};
