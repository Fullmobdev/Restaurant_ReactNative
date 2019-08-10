import geo from 'geolib';
import GoogleConfig from '../../config/app/google.api.config.js';
import { googleGetPlaceDetails } from '../search/search.library.js';
import { getScoreFromAddressComponentTypes } from '../search/address-component-types.constants.js';

const GOOGLE_API_KEY = GoogleConfig.apiKey;
const GOOGLE_API_URL = 'https://maps.google.com/maps/api/geocode/json';

getLocationForAddress = (address) => {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_API_KEY) {
      reject('API Key ');
    }

    if (!address) {
      reject('Provided address is invalid');
    }

    const url = `${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}&address=${encodeURI(address)}`;

    handleRemoteRequest(url)
    .then((res) => {
      const result = res.results[0].geometry.location;
      const longitude = result.lng;
      const latitude = result.lat;
      const location = { latitude, longitude };
      resolve(location);
    })
    .catch((error) => {
      reject(error);
    });
  });
};

handleRemoteRequest = (url) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
         response.json()
          .then((json) => {
            if (json.status === 'OK') {
              resolve(json);
            } else {
              reject(`Server returned status code ${json.status}`);
            }
          })
          .catch(() => {
            reject('Error fetching data');
          });
      })
      .catch(() => {
        reject('Error returned');
      });
  });
};


export const getNeighborhoodFromLocation = (location) => {
  return getAddressComponents(location)
  .then((addressComponents) => {
    const { results } = addressComponents;

    let currentComponent = results[0].address_components[2];

    results.forEach(result => {
      const { address_components } = result;
      address_components.forEach(component => {
        currentComponent = getMoreSpecificAddressComponent(currentComponent, component);
      });
    });

    return currentComponent.long_name;
  });
};

export const getAddressFromLocation = (location) => {
  return getAddressComponents(location)
  .then((addressComponents) => {
    const address = {
      state: null,
      coordinates: null
    };

    const { results } = addressComponents;
    const countryIndex = getCountryAddressResultIndex(results);

    if (countryIndex) {
      const stateResult = results[countryIndex - 1];
      const stateAddressComponent = stateResult.address_components[0];
      const coordinates = stateResult.geometry.location;
      const { long_name: stateName } = stateAddressComponent;
      address.state = stateName;
      address.coordinates = coordinates;
      return address;
    }

    return address;
  });
};

const getCountryAddressResultIndex = (addressResults) => {
  let countryIndex = null;
  addressResults.forEach((result, index) => {
    const { types } = result;

    if (types.includes('country')) {
      countryIndex = index;
      return;
    }
  });

  return countryIndex;
};

const getAddressComponents = (location) => {
  return new Promise((resolve, reject) => {
    if (location == null) reject('Null Location');
    
    let { lat, lng } = location;
    lat = lat || location.latitude;
    lng = lng || location.longitude;

    if (!GOOGLE_API_KEY) {
      reject('API Key ');
    }
    if (!lat || !lng) {
      reject('Provided location is invalid');
    }
    const url = `${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}&latlng=${lat},${lng}`;
    handleRemoteRequest(url)
    .then((res) => {
      resolve(res);
    })
    .catch(reject);
  });
};

/*
 * @returns true if the first address component argument
 * is less than the second
 * Note: Less than means more specific than. Neighborhood < Country
 */
const getMoreSpecificAddressComponent = (component1, component2) => {
  const component1Score = getScoreFromAddressComponentTypes(component1.types);
  const component2Score = getScoreFromAddressComponentTypes(component2.types);

  return component1Score > component2Score ? component1 : component2;
};

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    let location;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        location = { latitude, longitude };
        resolve(location);
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  });
};

export const getLocationFromAddress = (address) => {
  return new Promise((resolve, reject) => {
    if (address) {
      getLocationForAddress(address)
      .then((response) => {
        resolve(response);
      })
      .catch((error => {
        reject(error);
      }));
    } else {
      getCurrentLocation()
      .then((location) => {
        resolve(location);
      })
      .catch((error) => {
        reject(error);
      });
    }
  });
};

export const getLocationFromPlaceId = (placeId) => {
  if (!placeId) { return Promise.reject('Missing argument: placeId'); }

  return googleGetPlaceDetails(placeId)
  .then(detail => {
    const { lat, lng } = detail.geometry.location;
    return {
      latitude: lat,
      longitude: lng
    };
  });
};

export const distFromLocation = (coord1, coord2) => {
  if (isValidCoord(coord1) && isValidCoord(coord2)) {
    const distanceInMeters = geo.getDistance(coord1, coord2);
    return geo.convertUnit('mi', distanceInMeters, 1);
  }
  return null;
};

const isValidCoord = (coord) => {
  if (!coord) return false;

  const lat = coord.lat || coord.latitude;
  const lng = coord.lng || coord.longitude;

  if (lat === '0' && lng === '0') return false;

  return lat && lng;
};

/* Radius is currently hard coded.
   In future versions, this should
   be retrieved as part of the filter
   done by the user when they search
*/
export const getRadius = () => {
  return 1600;
};
