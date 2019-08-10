import { API, Places } from 'google-places-web';
import RNFetchBlob from 'react-native-fetch-blob';
import _ from 'lodash';
import * as GoogleSearchType from '../../types/search.types';
import GoogleConfig from '../../config/app/google.api.config.js';
import * as SearchConstants from './search.service.constants';

import { BusinessCategories } from '../business/business-categories.enum';
import { AddressComponentTypes } from './address-component-types.constants';

const GOOGLE_SEARCH_ENABLED = true;
const MIN_SEARCH_LENGTH = 1;

Places.apiKey = GoogleConfig.apiKey;
Places.debug = false;
Places.nearbysearch = function nearbysearch() {
  const opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  const params = this._permitParams(API.NEARBY_SEARCH, opts);

  return this._query(API.NEARBY_SEARCH.path, params).then(json => {
    return json.results;
  });
};

Places.photos = function photos(opts) {
  const params = this._permitParams(API.PHOTOS, opts);
  return this._query(API.PHOTOS.path, params).then(json => {
    return json.results;
  });
};

API.PHOTOS = {
  path: 'photo',
  requiredKeys: ['photoreference', 'maxheight', 'maxwidth'],
  optionalKeys: []
};

API.NEARBY_SEARCH = {
  path: 'nearbysearch',
  requiredKeys: ['location', 'radius'],
  optionalKeys: [
    'keyword',
    'language',
    'minprice',
    'maxprice',
    'name',
    'opennow',
    'rankby',
    'type',
    'pagetoken',
    'region'
  ]
};

API.DETAILS.optionalKeys = [
  ...API.DETAILS.optionalKeys,
  'sessiontoken'
];

API.AUTOCOMPLETE.optionalKeys = [
  ...API.AUTOCOMPLETE.optionalKeys,
  'sessiontoken'
];

//TODO - Need to figure out how to handle caching
this.state = {
  text: '',
  cache: [],
  tempCache: [],
  latitude: null,
  longitude: null
};

export const autocompleteAddress = (addressText) => {
  const input = addressText;
  const types = ['geocode'];

  return Places.autocomplete({ input, types })
  .then(regions => {
    return regions.map(region => {
      const { description, place_id } = region;
      return { description, placeId: place_id };
    });
  });
};

populateCache = details => {
  this.setState(state => ({
    cache: [...state.cache, details]
  }));
};

getCachedData = input => {
  return _.result(_.find(this.state.cache, { input }), 'details');
};

/* Promise uses the Google AutoComplete API to retrieve
    a list of locations matching with the input keyword
    as specified by input parameter @input.
    Function returns a maximum of 5 Location objects.
*/
const googleGetPlacesByInput = (input, types, location, radius, sessionToken) => {
  return new Promise((resolve, reject) => {
    let places = [];

    Places.autocomplete({ input, types, location, radius, sessiontoken: sessionToken })
      .then(plc => {
        places = plc;
        resolve(places);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/* Promise uses the Google Details API to retrieve details
    of a specified location identified by attribute @place_id.
    Function returns a detailed location object.
*/
export const googleGetPlaceDetails = (placeId, sessionToken) => {
  return new Promise((resolve, reject) => {
    let details = [];
    if (placeId) {
      Places.details({ placeid: placeId, sessiontoken: sessionToken })
        .then(det => {
          details = det;
          resolve(details);
        })
        .catch(error => {
          reject(error);
        });
    } else {
      resolve(details);
    }
  });
};

const autoComplete = (input, location, radius, searchType, sessionToken) => {
  return new Promise((resolve, reject) => {
    if (GOOGLE_SEARCH_ENABLED) {
      const type = searchType || GoogleSearchType.ESTABLISHMENT;

      if (input) {
        googleGetPlacesByInput(input, type, location, radius, sessionToken)
          .then(places => {
            resolve(places);
          })
          .catch(error => {
            reject(error);
          });
        } else {
          resolve([]);
        }
    } else {
      reject('SEARCH NOT IMPLEMENTED !');
    }
  });
};

fetchNeighborhoodFromAddressComponents = addressComponents => {
  const scores = [];
  for (let i = 3; i >= 0; i--) {
    if (addressComponents[i]) {
      // IN SOME CASES DURING SEARCH LESS THAN 4 addressComponents are returned
      const types = addressComponents[i].types;
      if (types.indexOf(AddressComponentTypes.neighborhood) > -1) {
        return addressComponents[i].short_name;
      } else if (types.indexOf(AddressComponentTypes.sublocality) > -1) {
        scores[i] = 3;
      } else if (types.indexOf(AddressComponentTypes.locality) > -1) {
        scores[i] = 2;
      } else if (types.indexOf(AddressComponentTypes.route) > -1) {
        scores[i] = 1;
      } else {
        scores[i] = 0;
      }
    }
  }
  return addressComponents[indexOfMax(scores)].short_name;
};

indexOfMax = arr => {
  if (arr.length === 0) {
    return -1;
  }

  let max = arr[0];
  let maxIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
};

export const getPredictionsForInput = (input, location, radius, type, sessionToken) => {
  return new Promise((resolve, reject) => {
    if (input.length < MIN_SEARCH_LENGTH) {
      resolve([]);
    } else {
      autoComplete(input, location, radius, type, sessionToken)
        .then(predictions => {
          resolve(predictions);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

export const loadBusinessesFromSearchText = (input, location, radius, type, sessionToken) => {
  const { latitude, longitude } = location;
  locationString = `${latitude}, ${longitude}`;

  return getPredictionsForInput(input, locationString, radius, type, sessionToken).then(results => {
    return results.map(result => {
      const { place_id, structured_formatting: structuredFormatting, types } = result;
      const { main_text, secondary_text } = structuredFormatting;
      const response = {
        name: main_text,
        place_id,
        photoReference: '',
        types,
        vicinity: secondary_text
      };
      return createBusinessFromResponse(response);
    });
  });
};

/**
 * Load restaurants near a specified location and radius. Resolves
 * a list of restaurants.
 * @param {Object} location
 * @param {Number} radius
 */
export const loadNearbyBusinesses = ({ latitude, longitude }, radius) => {
  const opts = {
    location: `${latitude},${longitude}`,
    radius,
    type: GoogleSearchType.RESTAURANT
  };

  return Places.nearbysearch(opts)
    .then(results => {
      const limitedBusinesses = results.slice(0, 5);
      const businesses = limitedBusinesses.map(result => {
        const photoReference = result.photos ? result.photos[0].photo_reference : '';
        return createBusinessFromResponse({ ...result, photoReference });
      });
      return businesses;
    });
};

export const loadPlacesDetails = (placeIds, sessionToken) => {
  const promises = placeIds.map(placeId => {
    return googleGetPlaceDetails(placeId, sessionToken)
      .then(detail => {
        const photoReference = detail.photos ? detail.photos[0].photo_reference : '';
        return createBusinessFromResponse({ ...detail, photoReference });
      })
      .then(business => {
        const dimension = SearchConstants.DEFAULT_PHOTO_DIMENSIONS;
        return loadBusinessPhoto(business.photoReference, dimension, dimension)
        .then(photoUri => {
          return {
            ...business,
            photoUri
          };
        });
      })
      .catch(() => null);
  });

  return Promise.all(promises);
};

export const loadBusinessPhoto = (photoReference, maxWidth, maxHeight) => {
  const opts = {
    photoreference: photoReference,
    maxwidth: maxWidth,
    maxheight: maxHeight
  };

  const requestUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${
    GoogleConfig.apiKey
  }`;

  return RNFetchBlob.fetch('GET', requestUrl).then(response => {
    const base64Data = response.base64();
    const dataUri = `data:image/jpeg;base64 ,${base64Data} `;

    return dataUri;
  });
};

export const createBusinessFromResponse = response => {
  const openingHours = response.opening_hours || {};
  const weekdayText = openingHours.weekday_text;
  const days = weekdayText || [];
  const hours = {};
  days.forEach(day => {
    const daysArray = split(day);
    hours[daysArray[0]] = daysArray[1];
  });

  const types = response.types;
  const businessCategory = getBusinessCategory(types);

  const neighborhood = response.address_components ?
    fetchNeighborhoodFromAddressComponents(response.address_components) : null;

  return {
    id: response.place_id,
    name: response.name,
    address: response.vicinity,
    location: response.geometry ? response.geometry.location : { lat: '0', lng: '0' },
    neighborhood,
    hours,
    openingPeriods: response.opening_hours ? response.opening_hours.periods : [],
    photoReference: response.photoReference,
    telephone: response.international_phone_number ? response.international_phone_number : '',
    website: response.website ? response.website : '',
    types,
    businessCategory,
    photos: response.photos,
    openNow: response.opening_hours ? response.opening_hours.open_now : undefined,
    rating: response.rating,
    priceLevel: response.price_level ? response.price_level : undefined
  };
};

const split = weekdayText => {
  const index = weekdayText.indexOf(':');
  const result = [];
  result.push(weekdayText.slice(0, index).trim());
  result.push(weekdayText.slice(index + 1).trim());
  return result;
};

//TODO - put this in a service.
const getBusinessCategoryFromBusinessType = businessType => {
  const businessTypeToCategoryMapping = {
    restaurant: BusinessCategories.restaurant,
    food: BusinessCategories.restaurant,
    bar: BusinessCategories.restaurant,
    cafe: BusinessCategories.restaurant,
    bakery: BusinessCategories.restaurant
  };
  return businessTypeToCategoryMapping[businessType];
};

const getBusinessCategory = businessTypes => {
  let response = BusinessCategories.other;
  businessTypes.map(businessType => {
    const businessCategory = getBusinessCategoryFromBusinessType(businessType);
    if (businessCategory) {
      response = businessCategory;
    }
    return true;
  });
  return response;
};
