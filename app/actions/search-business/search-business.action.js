import {
  FETCH_BUSINESS_SEARCH_PHOTO_FAILURE,
  FETCH_BUSINESS_SEARCH_PHOTO_REQUEST,
  FETCH_BUSINESS_SEARCH_PHOTO_SUCCESS,
  FETCH_PLACE_DETAILS_REQUEST,
  FETCH_PLACE_DETAILS_SUCCESS,
  FETCH_PLACE_DETAILS_FAILURE,
  SEARCH_BUSINESS,
  SEARCH_BUSINESS_CACHE_HIT,
  SEARCH_BUSINESS_REQUEST,
  SEARCH_BUSINESS_SUCCESS,
  SEARCH_BUSINESS_FAILURE
} from '../../types/search-business.types';

import { getBusinessPhotoFromPhotoReference } from '../../services/search/search.service';
import { loadPlacesDetails } from '../../services/search/search.library';

export const fetchBusinessPhoto = (id, photoReference) => {
  return (dispatch, getState) => {
    dispatch(fetchBusinessPhotoRequest(photoReference));

    const { businessSearch } = getState();
    const { businessPhotoSearchResults } = businessSearch;

    if (businessPhotoSearchResults[photoReference]) {
      const dataUri = businessPhotoSearchResults[photoReference];
      dispatch(fetchBusinessPhotoSuccess({ id, dataUri, photoReference }));
      return;
    }

    getBusinessPhotoFromPhotoReference(photoReference)
      .then(dataUri =>
        dispatch(
          fetchBusinessPhotoSuccess({
            id,
            dataUri,
            photoReference
          })
        )
      )
      .catch(error => dispatch(fetchBusinessPhotoFailure(error)));
  };
};

export const loadPlaceDetails = (placeId) => {
  return (dispatch, getState) => {
    const { businessSearch } = getState();
    const { businessSearchSessionToken } = businessSearch;
    
    dispatch(fetchPlaceDetailsRequest(placeId));

    loadPlacesDetails([placeId], businessSearchSessionToken)
    .then(details => {
      dispatch(fetchPlaceDetailsSuccess(details[0]));
    })
    .catch((error) => {
      dispatch(fetchPlaceDetailsFailure());
    });
  };
};

export const fetchBusinessPhotoFailure = error => {
  return {
    type: FETCH_BUSINESS_SEARCH_PHOTO_FAILURE,
    payload: error
  };
};

export const fetchBusinessPhotoRequest = () => {
  return {
    type: FETCH_BUSINESS_SEARCH_PHOTO_REQUEST
  };
};

export const fetchBusinessPhotoSuccess = payload => {
  return {
    type: FETCH_BUSINESS_SEARCH_PHOTO_SUCCESS,
    payload
  };
};

export const searchBusiness = (searchText, locationCoords, placeId) => {
  return {
    type: SEARCH_BUSINESS,
    payload: {
      searchText,
      locationCoords,
      placeId
    }
  };
};

export const searchBusinessCacheHit = searchText => {
  return {
    type: SEARCH_BUSINESS_CACHE_HIT,
    payload: searchText
  };
};

export const searchBusinessRequests = (searchText, sessionToken) => {
  return {
    type: SEARCH_BUSINESS_REQUEST,
    payload: { searchText, sessionToken }
  };
};

export const searchBusinessSuccess = (searchText, businesses) => {
  return {
    type: SEARCH_BUSINESS_SUCCESS,
    payload: {
      searchText,
      businesses
    }
  };
};

export const searchBusinessFailure = error => {
  return {
    type: SEARCH_BUSINESS_FAILURE,
    error: true
  };
};

export const fetchPlaceDetailsRequest = placeId => {
  return {
    type: FETCH_PLACE_DETAILS_REQUEST,
    payload: placeId
  };
};

export const fetchPlaceDetailsSuccess = details => {
  return {
    type: FETCH_PLACE_DETAILS_SUCCESS,
    payload: { details }
  };
};

export const fetchPlaceDetailsFailure = () => {
  return {
    type: FETCH_PLACE_DETAILS_FAILURE
  };
};
