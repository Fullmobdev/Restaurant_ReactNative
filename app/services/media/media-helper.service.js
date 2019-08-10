import _ from 'lodash';
import * as SceneType from '../../types/scene.types';

export const aggregateMediaDetails = (business, businessReviews, visits, timelineReviews, user, originator, isShowingLinkReview) => {

  if (originator === SceneType.TIMELINE) {
    return getReviewDetailsForTimeline(visits, timelineReviews, user, isShowingLinkReview);
  } else if (originator === SceneType.PROFILE) {
    return getReviewDetailsForProfile(visits, timelineReviews, user);
  }
    return getReviewDetailsForBusiness(visits, businessReviews, user);
};

export const getFirstReviewToWatch = (businessReviews, timelineReviews, originator, isShowingLinkReview, reviewStartIndex) => {
  if (originator === SceneType.TIMELINE) {
    return getFirstReviewToWatchTimeline(timelineReviews, isShowingLinkReview, reviewStartIndex);
  }

  return 0;
};

const getReviewDetailsForBusiness = (visits, businessReviews, user) => {
  const { selectedVisitsIds, selectedVisitIndex } = visits || {};

  if (selectedVisitsIds && selectedVisitsIds.length > 0) {
    return selectedVisitsIds.slice(selectedVisitIndex || 0).map(visitId => {
      const { reviewIds } = visits[visitId];
      return getReviews(reviewIds, businessReviews, user);
    });
  }

  const { selectedReviewIds, selectedReviewIndex } = businessReviews || {};
  const reviewIds = (selectedReviewIds || []).slice(selectedReviewIndex || 0);

  return [getReviews(reviewIds, businessReviews, user)];
};

const getReviews = (reviewIds, reviews, user) => {
  const { viewedReviewList } = user;

  return reviewIds.map(reviewId => {
    const { likeStatus, viewedStatus } = viewedReviewList && viewedReviewList[reviewId] ?
      viewedReviewList[reviewId] : {};

    const result = {
      ...reviews[reviewId],
      likeStatus: likeStatus || false,
      viewedStatus: viewedStatus || false
    };

    return result;
  });
};

const getReviewDetailsForTimeline = (visits, timelineReviews, user, isShowingLinkReview) => {
  const reviewsList = [];
  if (isShowingLinkReview) {
    const { linkReviews } = timelineReviews;
    linkReviews.forEach((review) => {
      if (typeof review === 'object') {
      const { businessName, reviewId } = review;
      let previousView = null;
      if (user.viewedReviewList) {
        previousView = user.viewedReviewList[reviewId];
      }
      const likeStatus = (previousView == null) ? false : previousView.likeStatus;
      const viewedStatus = (previousView == null) ? false : previousView.viewedStatus;

      reviewsList.push({
        businessName,
        ...review,
        likeStatus,
        viewedStatus
       });
     }
    });
  } else {
  const selectedReviewId = timelineReviews.selectedReviewIds[0];
  const selectedVisit = timelineReviews[selectedReviewId].visitId;
  const associatedReviewIds = visits[selectedVisit].reviewIds;

  associatedReviewIds.forEach((reviewId) => {
    const review = timelineReviews[reviewId];
    const { businessName } = review;

    let previousView = null;
    if (user.viewedReviewList) {
      previousView = user.viewedReviewList[reviewId];
    }
    const likeStatus = (previousView == null) ? false : previousView.likeStatus;
    const viewedStatus = (previousView == null) ? false : previousView.viewedStatus;

    reviewsList.push({
      businessName,
      ...review,
      likeStatus,
      viewedStatus
     });
  });
  }

  return [reviewsList];
};

const getFirstReviewToWatchTimeline = (timelineReviews, isShowingLinkReview, reviewStartIndex) => {
  if (isShowingLinkReview) {
    return reviewStartIndex;
  }
  return timelineReviews.index;
};

const getReviewDetailsForProfile = (visits, timelineReviews, user) => {
  const reviewsList = [];

  const selectedReviewId = timelineReviews.selectedReviewIds[0];
  const review = timelineReviews[selectedReviewId];
  const { businessName } = review;

  let previousView = null;
  if (user.viewedReviewList) {
    previousView = user.viewedReviewList[selectedReviewId];
  }
  const likeStatus = (previousView == null) ? false : previousView.likeStatus;
  const viewedStatus = (previousView == null) ? false : previousView.viewedStatus;

  reviewsList.push({
    businessName,
    ...review,
    likeStatus,
    viewedStatus
   });

  return [reviewsList];
};
