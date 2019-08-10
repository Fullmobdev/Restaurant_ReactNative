import firebase from 'react-native-firebase';
import moment from 'moment';
import {
  BUSINESS_ROOT_PATH,
  BUSINESS_BY_API_ROOT_PATH,
  BUSINESS_BY_DATE_ROOT_PATH,
  BUSINESS_BOOKMARKS_BY_BUSINESS,
  BUSINESS_BOOKMARKS_BY_USER
}
from './business-endpoints';
import * as authService from '../../services/authentication/authentication.service';
import * as DBService from '../../services/db-access.service';

const API_ID = 'apiId';
const CREATED_DATE = 'createdDate';

/**
 * Retrives the details for a business with the specified
 * businessId and businessCategory from firebase.
 *
 * Creates a real time stream which must be turned off once
 * the app is no longer in use.
 * @param {String} businessId
 * @param {String} businessCategory
 */
 export const fetchBusinessDetail = (businessId, businessCategory) => {
   const url = `${BUSINESS_ROOT_PATH}/${businessCategory}`;
   return firebase.database().ref(url).child(businessId);
 };

/**
 * Retrieves the businessKey for given placeId from firebase
 * @param {String} placeId
 * @returns {object} {businessId, businessCategory}
 */
export const fetchBusinessKeyByPlaceId = (placeId) => {
  return new Promise((resolve, reject) => {
    let result = {};
    const url = `${BUSINESS_BY_API_ROOT_PATH}`;
    firebase.database().ref(url)
      .orderByChild('apiId')
      .equalTo(placeId)
      .once('value')
      .then((dataSnapshot) => {
          const businessKey = getBusinessKey(dataSnapshot);
          if (businessKey) {
            const { businessId, businessCategory } = businessKey;
            result = { businessId, businessCategory };
          }
          resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * Note: There should be only one child in the snapshot
 * @param {firebase.database.DataSnapshot} dataSnapshot
 */
const getBusinessKey = (dataSnapshot) => {
  if (!dataSnapshot.exists()) {
      return null;
  }

  let businessId;
  let businessCategory;
  dataSnapshot.forEach((childSnapshot) => {
      businessId = childSnapshot.child('businessId').val();
      businessCategory = childSnapshot.child('businessCategory').val();
  });

  return { businessId, businessCategory };
};

/**
 * Bookmarks business for the given user
 * @param {String} businessId
 * @param {String} userId
 * @param {boolean} bookmarked
 */
export const bookmarkBusiness = (businessId, userId, bookmarked) => {
    const businessBookmarkPath = `${BUSINESS_BOOKMARKS_BY_BUSINESS}/${businessId}/${userId}`;
    const userBookmarkPath = `${BUSINESS_BOOKMARKS_BY_USER}/${userId}/${businessId}`;

    const updatedTime = moment.utc().format();

    const objectsToSave = {
      [businessBookmarkPath]: { bookmarked, updatedTime },
      [userBookmarkPath]: { bookmarked, updatedTime }
    };

    return DBService.updateGroup(objectsToSave)
    .then(() => {
      return;
    });
  };

  /* Fetch the list of businesses previously bookmarked by this user
   * specified by @param {String} userId.
   */
  export const fetchBookmarkedBusinesses = (userId, path = BUSINESS_BOOKMARKS_BY_USER) => {
    return firebase.database().ref(`${path}/${userId}`);
  };

/**
 * Persists the details of a new business and its corresponding artifacts
 * in the database
 *  @param {object} business
 */
export const createBusiness = (business) => {
  const businessCategory = business.businessCategory;
  const path = `${BUSINESS_ROOT_PATH}/${businessCategory}`;
  const businessId = firebase.database().ref().child(path).push().key;

  const apiId = (business.id) ? business.id : business.apiId;
  const businessName = (business.name) ? business.name : business.businessName;
  const address = business.address;
  const neighborhood = business.neighborhood;
  const telephone = business.telephone;
  const website = business.website;
  const openingPeriods = business.openingPeriods;
  const photoReference = business.photoReference;
  const photoUri = business.photoUri;
  const priceLevel = business.priceLevel;
  const googleRating = business.rating;
  const types = business.types;

  const now = moment.utc();
  const currentTime = now.format();
  const createdDate = now.format('YYYY-MM-DD');

  const hours = getBusinessHours(business);
  const location = getCoordinates(business);

  const businessContent = {
    apiId,
    businessId,
    businessName,
    businessCategory,
    address,
    neighborhood,
    location,
    telephone,
    website,
    hours,
    createdDate,
    openingPeriods,
    photoReference,
    photoUri,
    priceLevel,
    googleRating,
    types
  };

  const businessByCreatedDateContent = {
    createdBy: authService.getCurrentUser() ? authService.getCurrentUser().uid : business.userId,
    status: 'unverified',
    createdTime: currentTime
  };

  const businessByApiContent = {
    apiId,
    businessId,
    businessCategory
  };

  return storeBusinessWithRelatedArtifacts(businessId, businessCategory,
    businessContent, businessByApiContent, businessByCreatedDateContent);
};

const storeBusinessWithRelatedArtifacts = (businessId, businessCategory,
    businessContent, businessByApiContent, businessByCreatedDateContent) => {
  const businessPath = `${BUSINESS_ROOT_PATH}/${businessCategory}/${businessId}`;

  const businessApiId = businessByApiContent[API_ID];
  const businessByApiPath = `${BUSINESS_BY_API_ROOT_PATH}/${businessApiId}`;

  const createdDate = businessContent[CREATED_DATE];
  const dateId = `${createdDate}/${businessId}`;
  const businessByCreatedDatePath = `${BUSINESS_BY_DATE_ROOT_PATH}/${businessCategory}/${dateId}`;

  const objectsToSave = {
    [businessPath]: businessContent,
    [businessByApiPath]: businessByApiContent,
    [businessByCreatedDatePath]: businessByCreatedDateContent
  };

  return DBService.updateGroup(objectsToSave)
  .then(() => {
    return businessContent;
  });
};

const getCoordinates = (business) => {
  if (business.location) {
    return business.location;
  }
  return { lat: 0, long: 0 };
};

const getBusinessHours = (business) => {
  if (business.hours) {
    return business.hours;
  }

  const hours = { Sunday: '',
                  Monday: '',
                  Tuesday: '',
                  Wednesday: '',
                  Thursday: '',
                  Friday: '',
                  Saturday: ''
                };
    return hours;
};

/**
 * Fetch business info for a given business ID and category
 * @param {String} businessID
 * @param {String} businessCategory
 * @returns A promise containing info for the given business if successful
 */
export const fetchBusinessInfo = (businessId, businessCategory) => {
  const url = `${BUSINESS_ROOT_PATH}/${businessCategory}`;
  const businessRef = firebase.database().ref(url).child(businessId);

  return new Promise((resolve, reject) => {
    businessRef.once(
      'value',
      snapshot => resolve(snapshot.val()),
      error => reject(error));
  });
};
