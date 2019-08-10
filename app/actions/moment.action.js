import { MOMENT_FILTER_SELECTED, MOMENT_SELECTED, MOMENT_FILTER_CLEARED, MOMENT_URI_CHANGED, FILTERED_MOMENT_URI_SAVED } from '../types/moment.types';

export const momentSelected = (moment) => {
    return {
        type: MOMENT_SELECTED,
        payload: { moment }
    };
};

export const momentFilterSelected = (filter) => {
    return {
        type: MOMENT_FILTER_SELECTED,
        payload: { filter }
    };
};

export const momentFilterCleared = () => {
  return {
    type: MOMENT_FILTER_CLEARED,
    payload: ''
  };
};


export const momentURIChanged = (uri) => {
  return {
    type: MOMENT_URI_CHANGED,
    payload: { uri }
  };
};

export const filteredMomentPathSet = (uri) => {
  return {
    type: FILTERED_MOMENT_URI_SAVED,
    payload: { uri }
  };
};
