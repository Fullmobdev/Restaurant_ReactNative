import { combineReducers } from 'redux';

import {
    FETCH_BUSINESS_SEARCH_PHOTO_SUCCESS,
    SEARCH_BUSINESS,
    SEARCH_BUSINESS_CACHE_HIT,
    SEARCH_BUSINESS_FAILURE,
    SEARCH_BUSINESS_REQUEST,
    SEARCH_BUSINESS_SUCCESS,
    FETCH_PLACE_DETAILS_SUCCESS,
    FETCH_PLACE_DETAILS_FAILURE
} from '../../types/search-business.types';

import {
    FETCH_BUSINESS_RECOMMENDATIONS_REQUEST,
    FETCH_BUSINESS_RECOMMENDATIONS_SUCCESS,
    BOOKMARK_BUSINESS_SUCCESS
} from '../../types/business.types';

import { Moments } from '../../services/moments/moments.constants';

const businessSearchSessionToken = (state = null, action) => {
    switch (action.type) {
        case SEARCH_BUSINESS_REQUEST: 
            const { sessionToken } = action.payload;
            return sessionToken;
        
        case FETCH_PLACE_DETAILS_SUCCESS:
        case FETCH_PLACE_DETAILS_FAILURE:
            return null;

        default:
            return state;
    }
};

const businessSearchText = (state = '', action) => {
    switch (action.type) {
        case SEARCH_BUSINESS_CACHE_HIT:
            return action.payload;

        case SEARCH_BUSINESS_SUCCESS:
            return action.payload.searchText;

        default:
            return state;
    }
};

const businessSearches = (state = {}, action) => {
    switch (action.type) {
        case SEARCH_BUSINESS_SUCCESS:
            const { searchText, businesses } = action.payload;
            const businessIds = businesses.map((business) => {
                return business.id;
            });

            return { ...state, [searchText]: businessIds };

        default:
            return state;
    }
};

const businessSearchResultsInitialState = {
    isFetchingRecommendations: false,
    isFetchingBusinesses: false
};

const businessSearchResults = (state = businessSearchResultsInitialState, action) => {
    switch (action.type) {
        case FETCH_BUSINESS_SEARCH_PHOTO_SUCCESS: {
            const { id, dataUri } = action.payload;
            const updatedResult = { [id]: { ...state[id], photoUri: dataUri } };

            return { ...state, ...updatedResult };
        }

        case FETCH_BUSINESS_RECOMMENDATIONS_REQUEST:
            return { ...state, isFetchingRecommendations: true };

        case FETCH_BUSINESS_RECOMMENDATIONS_SUCCESS: {
            const businessRecommendations = action.payload || {};
            const { placeId, businessId, numOfRecommendations, numOfRecommends,
              percentRecommend } = businessRecommendations;

              let recommendations = {};
              const CustomerService = businessRecommendations[Moments.CustomerService];
              const Ambiance = businessRecommendations[Moments.Ambiance];
              const Food = businessRecommendations[Moments.Food];
              recommendations = { Food, Ambiance, CustomerService };


            const updatedResult = { [placeId]:
              { ...state[placeId],
                businessId,
                numOfRecommendations,
                numOfRecommends,
                percentRecommend,
                recommendations
              }
            };

            return { ...state, ...updatedResult, isFetchingRecommendations: false };
        }

        case SEARCH_BUSINESS_CACHE_HIT:
            return { ...state, isFetchingBusinesses: false };

        case SEARCH_BUSINESS_FAILURE:
            return { ...state, isFetchingBusinesses: false };

        case SEARCH_BUSINESS_SUCCESS:
            const businesses = {};
            action.payload.businesses.forEach((business) => {
                businesses[business.id] = { ...state[business.id], ...business };
            });

            return { ...state, ...businesses, isFetchingBusinesses: false };

        case SEARCH_BUSINESS:
            return { ...state, isFetchingBusinesses: true };

        case BOOKMARK_BUSINESS_SUCCESS: {
          const { placeId, businessId, bookmarked } = action.payload;
          const updatedResult = { [placeId]:
            { ...state[placeId], businessId, bookmarked }
          };

          return { ...state, ...updatedResult };
        }

        default:
            return state;
    }
};

const businessPhotoSearchResults = (state = {}, action) => {
    switch (action.type) {
        case FETCH_BUSINESS_SEARCH_PHOTO_SUCCESS:
            const { photoReference, dataUri } = action.payload;

            return { ...state, [photoReference]: dataUri };
        default:
            return state;
    }
};

export default combineReducers({
    businessSearchSessionToken,
    businessSearchText,
    businessSearches,
    businessSearchResults,
    businessPhotoSearchResults
});
