import { Moments } from '../../services/moments/moments.constants';
import {
  BOOKMARK_BUSINESS_SUCCESS,
  BUSINESS_SELECTED,
  FETCH_BUSINESS_DETAILS,
  FETCH_BUSINESS_RECOMMENDATIONS_SUCCESS,
  SELECT_BUSINESS
} from '../../types/business.types';
import { FilterTypes } from '../../types/filter.types';
import { FETCH_REVIEWS, FILTER_BUSINESS_REVIEWS } from '../../types/review.types';
import {
  FETCH_PLACE_DETAILS_REQUEST,
  FETCH_PLACE_DETAILS_SUCCESS
} from '../../types/search-business.types';
import { FETCH_DISCOVER_DATA_SUCCESS } from '../../types/discover.types';

import { filterReviewIds } from '../../utils/filter-reviews.utils';
import { isOpenNow } from '../../utils/open-now.utils';

/**
 * This object represents the business objects
 * indexed by the businessId
 */
export const INITIAL_STATE = {
  byPlaceId: {}
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_PLACE_DETAILS_REQUEST: { 
      const placeId = action.payload;
      const { selectedBusiness } = state;
      const { apiId } = selectedBusiness || {};

      if (placeId === apiId) {
        return {
          ...state,
          selectedBusiness: {
            ...selectedBusiness,
            loadingPlaceDetails: true
          }
        };
      }
      
      return state;
    }
    
    case FETCH_PLACE_DETAILS_SUCCESS: {
      const { details } = action.payload;
      const { businessCategory, id } = details;
      let { selectedBusiness } = state;
      const { apiId } = selectedBusiness || {};

      if (apiId === id) {
        selectedBusiness = { 
          ...selectedBusiness,
          businessCategory, 
          loadingPlaceDetails: false
        };
      }

      const currentPlaceDetails = state.byPlaceId[id] || {};
      const newPlaceDetails = { ...currentPlaceDetails, ...details };
      const newByPlaceId = { ...state.byPlaceId, [id]: newPlaceDetails };
      return { 
        ...state,
        selectedBusiness,
        byPlaceId: newByPlaceId 
      };
    }

    case FETCH_BUSINESS_DETAILS: {
      const businessDetails = fetchBusinessDetails(action.payload);
      return { 
        ...state, 
        [businessDetails.businessId]: {
          ...businessDetails,
          loaded: true
        }
      };
    }

    case FETCH_DISCOVER_DATA_SUCCESS: {
      const businessDetails = {};
      const discoverData = action.payload || {};
      Object.keys(discoverData).forEach(item => {
        const discoverCategory = discoverData[item];
        const businesses = discoverCategory.restaurants || {};

        Object.keys(businesses).forEach(buz => {
          const business = businesses[buz];
          const details = fetchBusinessDetails(business);
          const businessId = details.businessId;
          businessDetails[businessId] = { ...details };
        });
      });
      return { ...state, ...businessDetails };
    }

    case FETCH_REVIEWS: {
      const { businessId, filterBy } = action.payload;

      let updatedBusiness = { ...state[businessId] };
      let reviewIdsByMoment = { ...state.reviewIdsByMoment };
      const fetchedReviews = {};

      const visitIds = action.payload.reviews.map(visit => {
        const { lastReviewCreatedTime, isUserReview, userIdLastReviewCreatedTime, visitId, ...reviews } = visit;

        Object.values(reviews).forEach(review => {
          let { moment, reviewId } = review;
          review.isUserReview = isUserReview;
          fetchedReviews[reviewId] = review;
          moment = moment || Moments.Food;

          if (!reviewIdsByMoment[moment]) {
            reviewIdsByMoment[moment] = [];
          }
          reviewIdsByMoment[moment].push(reviewId);
        });

        return visit.visitId;
      });

      let headerReviewIds = filterReviewIds(Object.keys(fetchedReviews), fetchedReviews, FilterTypes.likes);
      headerReviewIds = headerReviewIds.slice(0, Math.min(3, headerReviewIds.length));

      reviewIdsByMoment = filterMomentReviewIds(reviewIdsByMoment, fetchedReviews, filterBy);
      updatedBusiness = { ...updatedBusiness, reviewIdsByMoment, visitIds, headerReviewIds };

      return { ...state, [businessId]: updatedBusiness };
    }
    case FILTER_BUSINESS_REVIEWS:
      const { filter, filterOrder, businessReviews } = action.payload;
      const { selectedBusiness } = state;
      let filterBusiness = state[selectedBusiness.businessId];
      let { reviewIdsByMoment } = filterBusiness;

      reviewIdsByMoment = filterMomentReviewIds(reviewIdsByMoment, businessReviews, filter, filterOrder);
      filterBusiness = { ...filterBusiness, reviewIdsByMoment };

      return { ...state, [selectedBusiness.businessId]: filterBusiness };

    case SELECT_BUSINESS: {
      const business = createBusinessFromPayload(action.payload);
      const { businessId: selectedBusinessId, apiId, businessCategory } = business;
      if (!selectedBusinessId) {
        return {
          ...state,
          byPlaceId: {
            ...state.byPlaceId,
            [apiId]: business,
          },
          selectedBusiness: { businessId: selectedBusinessId, apiId, businessCategory }
        };
      }

      return {
        ...state,
        selectedBusiness: { businessId: selectedBusinessId, apiId, businessCategory }
      };
    }

    case BUSINESS_SELECTED: {
      const { businessId, businessCategory } = action.payload;

      return { ...state, selectedBusiness: { businessId, businessCategory } }; //TODO - need to pass businessCategory back
    }

    case FETCH_BUSINESS_RECOMMENDATIONS_SUCCESS:
      const businessRecommendations = action.payload || {};
      const {
        businessId: busId,
        numOfRecommendations,
        numOfRecommends,
        percentRecommend,
        placeId
      } = businessRecommendations;

      let recommendations = {};
      const CustomerService = businessRecommendations[Moments.CustomerService];
      const Ambiance = businessRecommendations[Moments.Ambiance];
      const Food = businessRecommendations[Moments.Food];
      recommendations = { Food, Ambiance, CustomerService };

      if (!busId) {
        return state;
      }

      const updateResult = {
        [busId]: { 
          ...state[busId], 
          numOfRecommendations, 
          numOfRecommends, 
          percentRecommend, 
          recommendations,
          placeId
        }
      };

      return { ...state, ...updateResult };

    case BOOKMARK_BUSINESS_SUCCESS: {
      const { businessId } = action.payload;

      return {
        ...state,
        [businessId]: {
          ...(state[businessId] || {}),
          businessId
        },
        selectedBusiness: { 
          ...state.selectedBusiness,
          businessId
        }
      };
    }

    default:
      return state;
  }
};

const filterMomentReviewIds = (reviewIdsByMoment, businessReviews, filter, filterOrder) => {
  const result = {};

  Object.keys(reviewIdsByMoment).forEach(key => {
    const ids = reviewIdsByMoment[key];
    result[key] = filterReviewIds(ids, businessReviews, filter, filterOrder);
  });

  return result;
};

const fetchBusinessDetails = payload => {
  let businessDetails = payload || {};
  const businessDetailsRecommendations = {
    Ambiance: businessDetails.Ambiance,
    Food: businessDetails.Food,
    CustomerService: businessDetails[Moments.CustomerService]
  };
  // Note: Components consume the recommendation data packaged up in recommendations
  businessDetails = {
    ...state[businessDetails.businessId],
    ...businessDetails,
    recommendations: businessDetailsRecommendations
  };

  if (businessDetails.openNow == null) {
    businessDetails.openNow = isOpenNow(businessDetails.openingPeriods);
  }

  return businessDetails;
};

const createBusinessFromPayload = payload => {
  const {
    address,
    id,
    businessId,
    businessCategory,
    numOfRecommendations,
    numOfRecommends,
    percentRecommend,
    location,
    name,
    hours,
    openingPeriods,
    photoReference,
    photoUri,
    rating,
    telephone,
    website,
    openNow,
    photos,
    priceLevel,
    recommendations
  } = payload;
  return {
    address,
    apiId: id,
    businessId,
    businessCategory,
    businessName: name,
    location,
    numOfRecommendations,
    numOfRecommends,
    percentRecommend,
    hours,
    openingPeriods,
    photoReference,
    photoUri,
    rating,
    reviews: [],
    telephone,
    website,
    openNow,
    photos,
    priceLevel,
    recommendations
  };
};
