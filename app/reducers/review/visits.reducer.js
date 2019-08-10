import moment from 'moment';
import {
  FETCH_REVIEWS,
  FETCH_REVIEWS_SUCCESS,
  ADD_REVIEWS_SUCCESS,
  ADD_USER_REVIEWS_SUCCESS,
  FETCH_USER_REVIEWS_SUCCESS,
  REVIEW_SELECTED,
  VISIT_SELELCT
} from '../../types/review.types';

const INITIAL_STATE = { visitIds: [], userVisitIds: [], selectedVisitIds: [], selectedVisitIndex: null };

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_REVIEWS_SUCCESS:
      const { reviews: addedReviews, toLocation: addedToLocation } = action.payload;
      const { visitIds: addedVisitsIds, visitsWithReviewIds } =
        extractReviewIdsFromVisits(addedReviews);

      // Note: We should only receive one visitId. Either a newly added visit,
      // or a visit with a newly added review
      let updatedAddedVisitsIds = state.visitIds.filter((visitId) =>
        visitId !== addedVisitsIds[0]
      );

      if (addedToLocation === 'front') {
        updatedAddedVisitsIds = [...addedVisitsIds, ...updatedAddedVisitsIds];
      } else if (addedToLocation === 'back') {
        updatedAddedVisitsIds = [...updatedAddedVisitsIds, ...addedVisitsIds];
      }
      return { ...state, ...visitsWithReviewIds, visitIds: updatedAddedVisitsIds };

    case ADD_USER_REVIEWS_SUCCESS:
      return getUserReviewsSuccessState(state, action);

    case FETCH_USER_REVIEWS_SUCCESS:
      return getUserReviewsSuccessState(state, action);

    // Note: This action is dispatched when reviews are fetched
    // for a business
    case FETCH_REVIEWS:
      const { reviews: businessVisits } = action.payload;
      const businessVisitsObj = getVisitsObj(businessVisits);

      return { ...state, ...businessVisitsObj };

    case FETCH_REVIEWS_SUCCESS: {
      const visitIds = [];

      const visits = action.payload;
      visits.forEach(visit => {
        const visitId = visit.visitId;
        if (visitId && !state.visitIds.includes(visitId)) {
          visitIds.push(visitId);
        }
      }
      );

      const updatedVisitIds = visitIds.concat(state.visitIds);
      const results = getVisitsObj(visits);

      return { ...state, ...results, visitIds: updatedVisitIds, newVisitIds: visitIds };
    }

    case VISIT_SELELCT:
      const { selectedVisitsIds, selectedVisitIndex } = action.payload;
      const newState = { ...state, selectedVisitsIds, selectedVisitIndex };
      return newState;

    case REVIEW_SELECTED:
      return { ...state, selectedVisitsIds: [], selectedVisitIndex: null };

    default:
      return state;
  }
};

const getVisitsObj = (visits) => {
  const results = {};
  visits.forEach((visit) => {
    const { lastReviewCreatedTime, userIdLastReviewCreatedTime, visitId, isUserReview, lastReviewCreatedTimestamp, ...reviews } = visit;
    if (visitId) {
      const reviewArray = sortReviews(reviews);
      const reviewIds = [];
      reviewArray.forEach(review => {
        reviewIds.push(review.reviewId);
       })
      results[visitId] = { reviewIds, lastReviewCreatedTime, userIdLastReviewCreatedTime };
    }
  });
  return results;
};

const extractReviewIdsFromVisits = (visits) => {
  const visitIds = [];
  const visitsWithReviewIds = [];

  visits.forEach((visit) => {
    const reviewArray = sortReviews(visit);
    const reviewIds = [];
    reviewArray.forEach(review => {
      if (review.reviewId) {
        reviewIds.push(review.reviewId);
      }
    });

    const lastReviewCreatedTime = visit.lastReviewCreatedTime;
    const userIdLastReviewCreatedTime = visit.userIdLastReviewCreatedTime;
    const visitId = visit.visitId;
    visitIds.push(visitId);

    visitsWithReviewIds[visitId] = {
      reviewIds, lastReviewCreatedTime, userIdLastReviewCreatedTime };
  });

  return { visitIds, visitsWithReviewIds };
};

const getUserReviewsSuccessState = (state, action) => {
  const results = {};
  const { reviews, toLocation, userId } = action.payload;

  const newVisitIds = [];
  let userVisitIds = {};

  reviews.forEach(visit => {
    const visitId = visit.visitId;
    if (visitId) {
      const reviewIds = [];
      Object.values(visit)
        .forEach(review => {
          const reviewId = review.reviewId;
          if (reviewId) {
            reviewIds.push(reviewId);
          }
        });
      newVisitIds.push(visitId);
      const lastReviewCreatedTime = visit.lastReviewCreatedTime;
      const userIdLastReviewCreatedTime = visit.userIdLastReviewCreatedTime;
      results[visitId] = { reviewIds, lastReviewCreatedTime, userIdLastReviewCreatedTime };
    }
  });

  //TODO - don't add a visit to the list if it already exists in state
  //This just means it was redelivered due to onValue() in firebase
  const currentUserVisitIds = state.userVisitIds[userId] || [];
  if (toLocation === 'front') {
    userVisitIds = {
      ...userVisitIds, [userId]: newVisitIds.concat(currentUserVisitIds)
    };
  } else {
    userVisitIds = {
      ...userVisitIds, [userId]: currentUserVisitIds.concat(newVisitIds)
    };
  }

  const newUserVisitIds = { ...state.userVisitIds, ...userVisitIds };

  return { ...state, userVisitIds: newUserVisitIds, ...results }; //TODO - store results in state but don't override FETCH_REVIEWS_SUCCESS state
};

const sortReviews = (reviews) => {
  const reviewsArray = Object.values(reviews); //Sort reviews in order which they were created
  return reviewsArray.sort((a, b) => {
    if (moment(a.createdTime).isAfter(moment(b.createdTime))) {
      return 1;
    }
    if (moment(a.createdTime).isBefore(moment(b.createdTime))) {
      return -1;
    }
    return 0;
  });
};
