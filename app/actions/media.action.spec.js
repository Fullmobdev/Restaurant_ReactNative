import * as actions from './media.action';
import * as types from '../types/media.types';

describe('media actions', () => {
  it('Creates a media captured action', () => {
    const param = { uri: 'file://', mediaType: 'camera' };
    const expectedAction = {
      type: types.MEDIA_CAPTURED,
      payload: param
    };
    expect(actions.mediaCaptured(param)).toEqual(expectedAction);
  });
});
