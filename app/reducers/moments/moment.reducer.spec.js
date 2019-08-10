import reducer, { INITIAL_STATE } from './moment.reducer';
import * as types from '../../types/media.types';

describe('Moment reducer', () => {
  it('Has a default state', () => {
    const action = { type: 'unexpected' };
    const expectedState = INITIAL_STATE;
    expect(reducer(undefined, action)).toEqual(expectedState);
  });

  it('Returns the state when media is captured', () => {
    const payload = { uri: '.....', mediaType: 'mp4' };
    const action = { type: types.MEDIA_CAPTURED, payload };
    const expectedState = { ...payload };
    expect(reducer(undefined, action)).toEqual(expectedState);
  });
}); 
