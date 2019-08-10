import firebase from 'react-native-firebase';
import moment from 'moment';
import { fetchBusinessKeyByPlaceId } from '../business/business.service';
import {
  BUSINESS_RECOMMENDATIONS_PATH,
  RECOMMENDATIONS_BY_USER_PATH,
  RECOMMENDATIONS_BY_BUSINESS_PATH }
from '../../services/recommendation/recommendation-endpoints';

/**
 * Retrieves the recommendations for a business with a given key identified
 * by the given businessId and businessCategory from the BusinessRecommendations
 * object in the database.
 *
 * Creates a real time stream which must be turned off once the app is no
 * longer in use.
 *
 */
export function getBusinessRecommendationByKey(businessId, businessCategory) {
  const url = `${BUSINESS_RECOMMENDATIONS_PATH}/${businessCategory}/${businessId}`;
  return firebase.database().ref(url);
}

/**
 * Retrieves a user's recommendation of a business for a specific
 * moment from the RecommendationsByUser object in the database.
 * @param {string} userId
 * @param {string} placeId
 * @param {string} moments
 */
export function getUserRecommendationByPlaceId(userId, placeId, moments) {
    return fetchBusinessKeyByPlaceId(placeId)
    .then((businessKey) => {
        const { businessId } = businessKey;
        const path = `${RECOMMENDATIONS_BY_USER_PATH}/${userId}/${businessId}`;

        return firebase.database().ref(path).once('value')
        .then((snapshot) => {
            return {
                businessId,
                recommendation: snapshot.val()
            };
        });
    });
}

export function setRecommendation(userId, businessId, businessCategory, moments, recommendation) {
    return setUserRecommendation(userId, businessId, moments, recommendation)
    .then(() => {
        return setBusinessRecommendation(userId, businessId, businessCategory, moments, recommendation);
    });
}
/**
 * Sets the recomendation in the RecommendationsByUser object in the database. The
 * object structure is as follows:
 * RecommendationsByUser: {
 *  firebase_user_id: {
 *   firebase_business_id: {
 *    moment: {
 *     recommend: boolean
 *    }
 *   }
 *  }
 * }
 * @param {string} userId
 * @param {string} businessId
 * @param {string} moments
 * @param {boolean} recommendation
 */
export function setUserRecommendation(userId, businessId, moments, recommendation) {
    const path = `${RECOMMENDATIONS_BY_USER_PATH}/${userId}/${businessId}/${moments}`;
    const now = moment.utc().format();

    return firebase.database().ref(path).set({
        recommend: recommendation,
        updatedTime: now
    });
}

/**
 * Sets the recommendation in the RecommendationsByBusiness object in the database. The
 * object structure is as follows:
 * RecommendationsByBusiness: {
 *  business_category: {
 *   firebase_business_id: {
 *    moment: {
 *     firebase_user_id: { recommend: boolean }
 *    }
 *   }
 *  }
 * }
 * @param {string} userId
 * @param {string} businessId
 * @param {string} moments
 * @param {boolean} recommendation
 */
export function setBusinessRecommendation(userId, businessId, businessCategory, moments, recommendation) {
    const path = `${RECOMMENDATIONS_BY_BUSINESS_PATH}/${businessCategory}/${businessId}/${moments}/${userId}`;
    const now = moment.utc().format();

    return firebase.database().ref(path).set({
        recommend: recommendation,
        updatedTime: now
    });
}

/**
 * Detatches the listners currently attached to firebase for specific businesses
 * @param {object} businessKeys { [businessId: 'xxx', businessCategory: 'xxx']}
 */
export const detatchRecommendationsListner = (businessKeys) => {
  businessKeys.forEach((businessKey) => {
    const { businessId, businessCategory } = businessKey;
    if (businessId) {
      const url = `${BUSINESS_RECOMMENDATIONS_PATH}/${businessCategory}/${businessId}`;
      const Path = firebase.database().ref(url);
      Path.off();
    }
  });
};
