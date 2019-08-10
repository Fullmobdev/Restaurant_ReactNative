import * as types from '../types/media.types';

export const mediaCaptured = ({ mediaType, uri }) => {
  return {
    type: types.MEDIA_CAPTURED,
    payload: { mediaType, uri }
  };
};
