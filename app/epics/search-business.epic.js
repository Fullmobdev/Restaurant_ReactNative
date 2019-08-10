import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';

// Action creators
import {
  searchBusinessCacheHit,
  searchBusinessFailure,
  searchBusinessRequests,
  searchBusinessSuccess
} from '../actions/search-business/search-business.action';

// Action types
import { SEARCH_BUSINESS } from '../types/search-business.types';

// Services
import { getLocationFromAddress, getLocationFromPlaceId, getRadius } from '../services/location/location.service';
import { getBusinessesFromSearchText } from '../services/search/search.service';

export const searchBusinessEpic = (action$, { getState, dispatch }) => {
  return action$
    .ofType(SEARCH_BUSINESS)
    .debounce(action => {
      if (action.payload.searchText === '') {
        return Observable.interval();
      }
      return Observable.interval(300);
    })
    .switchMap(action => {
      const { searchText, locationCoords, placeId } = action.payload;
      const { businessSearch } = getState();
      const { businessSearches, businessSearchSessionToken } = businessSearch;
      const sessionToken = businessSearchSessionToken || generateSearchSessionToken();

      dispatch(searchBusinessRequests(searchText, sessionToken));

      if (businessSearches[searchText] && !locationCoords && !placeId) {
        return Observable.of(searchBusinessCacheHit(searchText));
      }

      return Observable.fromPromise(fetchBusinesses(action.payload, sessionToken))
        .map(businesses => searchBusinessSuccess(searchText, businesses))
        .catch(error => {
          return Observable.of(searchBusinessFailure(error));
        });
    });
};

const fetchBusinesses = ({ searchText, locationCoords, placeId }, sessionToken) => {
  if (locationCoords) {
    return getBusinessesFromSearchText(searchText, locationCoords, null, sessionToken);
  }

  if (placeId) {
    return getLocationFromPlaceId(placeId)
    .then(location => {
      return getBusinessesFromSearchText(searchText, location, null, sessionToken);
    });
  }

  return getLocationFromAddress('').then(location => {
    return getBusinessesFromSearchText(searchText, location, null, sessionToken);
  });
};

const generateSearchSessionToken = () => {
  return `SESSION_TOKEN_${Date.now()}`;
};
