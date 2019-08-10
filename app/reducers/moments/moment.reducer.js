import { MEDIA_CAPTURED } from '../../types/media.types.js';
import {
  MOMENT_FILTER_SELECTED,
  MOMENT_SELECTED,
  MOMENT_FILTER_CLEARED,
  MOMENT_URI_CHANGED,
  FILTERED_MOMENT_URI_SAVED
} from '../../types/moment.types';
import { FETCH_BUSINESS_USER_RECOMMENDATION_SUCCESS } from '../../types/business.types';
import {
  REVIEW_BUSINESS_TEXT_ADDED,
  REVIEW_BUSINESS_SELECTED,
  REVIEW_BUSINESS_RATED
} from '../../types/review-business.types';
import {
  FETCH_PLACE_DETAILS_REQUEST,
  FETCH_PLACE_DETAILS_SUCCESS 
} from '../../types/search-business.types';
import { FilterNames } from '../../components/filters/filters.constants';

export const INITIAL_STATE = {
  filterName: FilterNames.None,
  uri: '',
  filteredUri: '',
  mediaType: '',
  name: '',
  business: null,
  recommendation: null,
  recommendationLoaded: false,
  placeDetailsLoading: false,
  text: null
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_PLACE_DETAILS_REQUEST: {
      return {
        ...state,
        placeDetailsLoading: true
      };
    }

    case FETCH_PLACE_DETAILS_SUCCESS:
      const { details } = action.payload;
      const { id } = details;
      const { business } = state;

      if (!business || business.id !== id) { return state; }

      return {
        ...state,
        business: {
          ...business,
          ...details
        },
        placeDetailsLoading: false
      };

    case FETCH_BUSINESS_USER_RECOMMENDATION_SUCCESS:
      const { recommendation } = action.payload;

      const previousRecommendation =
        recommendation && recommendation[state.name] ? recommendation[state.name].recommend : null;

      return { ...state, recommendation: previousRecommendation, recommendationLoaded: true };

    case MEDIA_CAPTURED:
      return { ...state, uri: action.payload.uri, mediaType: action.payload.mediaType };

    case FILTERED_MOMENT_URI_SAVED:
      return { ...state, filteredUri: action.payload.uri };

    case MOMENT_FILTER_SELECTED:
      return { ...state, filterName: action.payload.filter };

    case MOMENT_FILTER_CLEARED:
      return { ...state, filterName: '' };

    case MOMENT_SELECTED:
      return { ...state, name: action.payload.moment };
    case MOMENT_URI_CHANGED:
      return { ...state, uri: action.payload.uri };

    case REVIEW_BUSINESS_TEXT_ADDED:
      return { ...state, text: action.payload.text, textStyles: action.payload.textStyles };

    case REVIEW_BUSINESS_SELECTED:
      return { ...state, business: action.payload, recommendationLoaded: false };

    case REVIEW_BUSINESS_RATED:
      return { ...state, rating: action.payload };
    default:
      return state;
  }
};
