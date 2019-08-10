import moment from 'moment';
import { CREATE_EXPERIENCE_REQUEST, CREATE_EXPERIENCE_SUCCESS } from '../types/experience.types';
import { RATINGS_BY_BUSINESS, RATINGS_BY_USER }
from '../services/experience/ratings-endpoint.js';
import * as DBService from '../services/db-access.service';

export const createExperience = (businessId, visitId, rating, selectedTags) => {
  return (dispatch, getState) => {
    const { uid } = getState().user;
    const currentTime = moment.utc().format();

    const experience = {
      rating,
      tags: selectedTags,
      createdTime: currentTime
    };

    dispatch(createExperienceRequest({ businessId }));

    const businessRatingsPath = `${RATINGS_BY_BUSINESS}/${businessId}/${uid}/${visitId}`;
    const userRatingsPath = `${RATINGS_BY_USER}/${uid}/${businessId}/${visitId}`;

    const updates = {
      [businessRatingsPath]: experience,
      [userRatingsPath]: experience,
    };

    return DBService.updateGroup(updates).then(() => {
        dispatch(createExperienceSuccess({ visitId }));
    });
  };
};

const createExperienceRequest = experience => {
  return {
    type: CREATE_EXPERIENCE_REQUEST,
    payload: experience
  };
};

const createExperienceSuccess = experience => {
  return {
    type: CREATE_EXPERIENCE_SUCCESS,
    payload: experience
  };
};
