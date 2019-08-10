import * as DiscoverService from '../services/discover/discover.service';
// Redux types
import {
  DISCOVER_TOP_REVIEWERS_UPDATE, 
  FETCH_DISCOVER_DATA_REQUEST, 
  FETCH_DISCOVER_DATA_SUCCESS 
} from '../types/discover.types';

export const fetchDiscoverData = () => {
  return dispatch => {
    dispatch({ type: FETCH_DISCOVER_DATA_REQUEST });

    DiscoverService.fetchDiscoverData().once('value', snapshot => {
      dispatch({
        type: FETCH_DISCOVER_DATA_SUCCESS,
        payload: snapshot.val()
      });
    });
  };
};

export const watchTopReviewers = () => {
  let initialDataLoaded = false;

  return dispatch => {
    DiscoverService.watchTopReviewersForUpdates()
    .on('value', snapshot => {
      if (initialDataLoaded) {
        const topReviewers = snapshot.val();
        dispatch(topReviewersUpdate({ topReviewers }));
      } else {
        initialDataLoaded = true;
      }
    });
  };
};

const topReviewersUpdate = (payload) => {
  return {
    type: DISCOVER_TOP_REVIEWERS_UPDATE,
    payload
  };
};
