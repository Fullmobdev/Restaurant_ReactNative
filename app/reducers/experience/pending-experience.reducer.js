import _ from 'lodash';
import { CREATE_REVIEW_SUCCESS } from '../../types/review.types';
import { CREATE_EXPERIENCE_SUCCESS } from '../../types/experience.types';

const INITIAL_STATE = { };

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CREATE_REVIEW_SUCCESS: {
      const experience = {};

      const { visitId, businessId, businessName, userId, createdTime, thumbnail } = action.payload;

      experience[visitId] =
      { businessId, businessName, userId, createdTime, thumbnail };
      return { ...state, ...experience };
    }

    case CREATE_EXPERIENCE_SUCCESS: {
      const { visitId } = action.payload;
      return _.omit(state, visitId);
    }
    default:
      return state;
  }
};
