import {
  FETCH_BUSINESS_DETAILS,
  FETCH_BUSINESS_NEIGHBORHOOD_SUCCESS,
  FETCH_BUSINESS_USER_RECOMMENDATION_REQUEST,
  FETCH_BUSINESS_USER_RECOMMENDATION_SUCCESS,
  FETCH_BUSINESS_USER_RECOMMENDATION_FAILURE,
  FETCH_BUSINESS_RECOMMENDATIONS_REQUEST,
  FETCH_BUSINESS_RECOMMENDATIONS_SUCCESS,
  FETCH_BUSINESS_RECOMMENDATIONS_FAILURE,
  BOOKMARK_BUSINESS_REQUEST,
  BOOKMARK_BUSINESS_SUCCESS,
  BOOKMARK_BUSINESS_FAILURE,
  SELECT_BUSINESS,
  BUSINESS_SELECTED
} from '../types/business.types';

import * as businessService from '../services/business/business.service';
import * as recommendationService from '../services/recommendation/recommendation.service';
import { getNeighborhoodFromLocation } from '../services/location/location.service';

export const selectBusiness = business => {
  return {
    type: SELECT_BUSINESS,
    payload: business
  };
};

export const businessSelected = (businessId, businessCategory) => {
  return {
    type: BUSINESS_SELECTED,
    payload: { businessId, businessCategory }
  };
};

/**
 * Fetch the user recommendations for the business identified by
 * the given Google PlaceId.
 * @param placeId
 */
export const fetchBusinessRecommendByUser = (placeId, moment) => {
  return (dispatch, getState) => {
    const { user } = getState();
    const userId = user.uid;

    dispatch(
      fetchBusinessRecommendByUserRequest({
        placeId,
        userId,
        moment
      })
    );

    recommendationService
      .getUserRecommendationByPlaceId(userId, placeId, moment)
      .then(recommendation => {
        dispatch(
          fetchBusinessRecommendByUserSuccess({
            userId,
            ...recommendation,
            moment
          })
        );
      })
      .catch(error => {
        dispatch(fetchBusinessRecommendByUserFailure(error));
      });
  };
};

/**
 * Fetch the business recommendations for the business identified by
 * the given Google PlaceId.
 * @param placeId
 */
export const fetchBusinessRecommendationsByPlaceId = placeId => {
  return dispatch => {
    //TODO: Don't fetch from database if we've already fetched before
    dispatch(fetchBusinessRecommendationsRequest());

    return businessService
      .fetchBusinessKeyByPlaceId(placeId)
      .then(businessKey => {
        const { businessId, businessCategory } = businessKey;

        if (businessId && businessCategory) {
          return fetchBusinessRecommendationsByKey(businessKey, placeId, dispatch);
        }
        
        dispatch(fetchBusinessRecommendationsFailure('BusinessId or BusinessCategory not found.'));
      })
      .catch(error => {
        dispatch(fetchBusinessRecommendationsFailure(error));
      });
  };
};

export const fetchBusinessRecommendationsByBusinessId = (businessId, businessCategory) => {
  return dispatch => {
    fetchBusinessRecommendationsByKey({
      businessId,
      businessCategory
    }, null, dispatch);
  };
};

/**
 * Retrieves the business recommendations for given business specified
 * by the given businessKey. Recommendations will continue to be automatcially
 * received from firebase and updated in the store until the firebase
 * listener is turned off.
 * @param {object} businessKey {businessId: xxx, businessCategory: 'xxx'}
 * @param {String} placeId
 * @param {object} dispatch
 */
const fetchBusinessRecommendationsByKey = (businessKey, placeId, dispatch) => {
  const { businessId, businessCategory } = businessKey;
  recommendationService
    .getBusinessRecommendationByKey(businessId, businessCategory)
    .on('value', snapshot => {
      recommendations = snapshot.val();
      const businessRecommendations = { placeId, businessId, ...recommendations };
      dispatch(
        {
          type: FETCH_BUSINESS_RECOMMENDATIONS_SUCCESS,
          payload: businessRecommendations
        },
        { allowMore: true }
      );
    });
};

/**
 * Function retrieves details of an already onboarded restaurant
 * identified by its unique FirebaseId businessId and category
 * subsequently update the redux store with the data received.
 * Function executes once. Function is triggered only once and
 * receives no further callbacks from firebase.
 * @param {String} businessId
 * @param {String} businessCategory
 */
export const fetchBusinessDetail = (businessId, businessCategory) => {
  return (dispatch, getState) => {
    const { businesses } = getState();
    const business = businesses[businessId];
    //We already have details of this business in the store, no need to refetch
    if (business && business.loaded) return;

    businessService.fetchBusinessDetail(businessId, businessCategory).once('value', snapshot => {
      if (snapshot.val()) {
        dispatch({
          type: FETCH_BUSINESS_DETAILS,
          payload: snapshot.val()
        });
      }
    });
  };
};

/**
 * Fetches the neighborhood data for the business
 * @param businessId
 * @param location the location object `{ lat: '', lng: '' }`
 * @param reviewId Used if we're fetching business neighborhood on timeline
 * page. Allows us to update that review in the reducer
 */
export const fetchBusinessNeighborhood = (businessId, location, reviewId) => {
  return dispatch => {
    console.log(businessId, reviewId);
    getNeighborhoodFromLocation(location)
    .then(result => {
      dispatch(fetchBusinessNeighborhoodSuccess({ businessId, reviewId, neighborhood: result }));
    });
  };
};

const fetchBusinessNeighborhoodSuccess = (payload) => {
  return {
    type: FETCH_BUSINESS_NEIGHBORHOOD_SUCCESS,
    payload
  };
};

/**
 * Function to bookmark a business for user currently logged in.
 * If the business doesn't exist i.e., (not yet onboarded), create
 * it first before proceeding to bookmark.
 * @param {object} bookmarked
 */
export const bookmarkBusiness = (bookmarked) => {
  return (dispatch, getState) => {
    const { businesses, user } = getState();
    const userId = user.uid;
    const { businessId: selectedBusinessId, apiId: selectedApiId } = businesses.selectedBusiness;
    const business = businesses[selectedBusinessId] || businesses.byPlaceId[selectedApiId];

    let { businessId, apiId: placeId } = business;

    dispatch(bookmarkBusinessRequest(businessId, placeId, bookmarked));

    if (businessId == null) {
      businessService
        .createBusiness(business)
        .then(newBusiness => {
          businessId = newBusiness.businessId;
          businessService.bookmarkBusiness(businessId, userId, bookmarked).then(() => {
            dispatch(bookmarkBusinessSuccess(businessId, placeId, bookmarked));
          });
        })
        .catch(error => {
          dispatch(bookmarkBusinessFailure(error));
        });
    } else {
      businessService.bookmarkBusiness(businessId, userId, bookmarked).then(() => {
        dispatch(bookmarkBusinessSuccess(businessId, placeId, bookmarked));
      });
    }
  };
};

export const bookmarkBusinessRequest = (businessId, placeId, bookmarked) => {
  return {
    type: BOOKMARK_BUSINESS_REQUEST,
    payload: { businessId, placeId, bookmarked }
  };
};

export const bookmarkBusinessSuccess = (businessId, placeId, bookmarked) => {
  return {
    type: BOOKMARK_BUSINESS_SUCCESS,
    payload: { businessId, placeId, bookmarked }
  };
};

export const bookmarkBusinessFailure = error => {
  return {
    type: BOOKMARK_BUSINESS_FAILURE,
    payload: error
  };
};

export const fetchBusinessRecommendByUserRequest = businessId => {
  return {
    type: FETCH_BUSINESS_USER_RECOMMENDATION_REQUEST,
    payload: businessId
  };
};

export const fetchBusinessRecommendByUserSuccess = recommendation => {
  return {
    type: FETCH_BUSINESS_USER_RECOMMENDATION_SUCCESS,
    payload: recommendation
  };
};

export const fetchBusinessRecommendByUserFailure = error => {
  return {
    type: FETCH_BUSINESS_USER_RECOMMENDATION_FAILURE,
    payload: error,
    error: true
  };
};

export const fetchBusinessRecommendationsRequest = () => {
  return {
    type: FETCH_BUSINESS_RECOMMENDATIONS_REQUEST
  };
};

export const fetchBusinessRecommendationsSuccess = businessRecommendations => {
  return {
    type: FETCH_BUSINESS_RECOMMENDATIONS_SUCCESS,
    payload: businessRecommendations
  };
};

export const fetchBusinessRecommendationsFailure = error => {
  return {
    type: FETCH_BUSINESS_RECOMMENDATIONS_FAILURE,
    payload: error
  };
};
