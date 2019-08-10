import { 
  DISCOVER_TOP_REVIEWERS_UPDATE,
  FETCH_DISCOVER_DATA_SUCCESS 
} from '../types/discover.types';

const INITIAL_STATE = {};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case DISCOVER_TOP_REVIEWERS_UPDATE:
      const { topReviewers } = action.payload;
      return {
        ...state,
        TopReviewers: topReviewers
      };
      
    case FETCH_DISCOVER_DATA_SUCCESS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
