import * as search from './search.library';
import * as SearchConstants from './search.service.constants';

export const getAutocompleteForAddress = (addressText) => {
  return search.autocompleteAddress(addressText);
};

export const getPredictionsForInput = (input, location, radius) => {
  return new Promise((resolve, reject) => {
    search.getPredictionsForInput(input, location, radius)
    .then((results) => {
      resolve(results);
    })
    .catch((error) => {
      reject(error);
    });
  });
};

/**
 * Get a list of businesses close to a specific location
 * @param {object} location
 * @param {number} radius
 */
export const getNearbyBusinesses = (location, radius) => {
  return search.loadNearbyBusinesses(location, radius);
};

/**
 * Get a list of businesses close to a specific location based on a
 * specific search text.
 * @param {string} input
 * @param {object} location
 * @param {number} radius
 */
export const getBusinessesFromSearchText = (input, location, radius, sessionToken) => {
  if (input) {
    return search.loadBusinessesFromSearchText(input, location, radius, null, sessionToken);
  }

  radius = radius || SearchConstants.DEFAULT_RADIUS;
  return search.loadNearbyBusinesses(location, radius);
};


/**
 * Get a photo based on a google photoreference
 * @param {string} photoReference
 * @param {number} maxWidth
 * @param {number} maxHeight
 */
export const getBusinessPhotoFromPhotoReference = (photoReference, maxWidth, maxHeight) => {
  const searchMaxWidth = maxWidth || SearchConstants.DEFAULT_PHOTO_DIMENSIONS;
  const searchMaxHeight = maxHeight || SearchConstants.DEFAULT_PHOTO_DIMENSIONS;
  return search.loadBusinessPhoto(photoReference, searchMaxWidth, searchMaxHeight);
};
