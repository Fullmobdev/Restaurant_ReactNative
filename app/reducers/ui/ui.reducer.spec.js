import reducer, { INITIAL_STATE } from './ui.reducer';
import * as types from '../../types/authentication.types';

describe('Authentication UI Reducer', () => {
  describe('Requests', () => {
    it('Has a default state', () => {
      const action = { type: 'unexpected' };
      const expectedState = { loading: '', error: '' };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    it('Returns the state for creating user request', () => {
      const action = { type: types.CREATE_USER_REQUEST };
      const expectedState = { ...INITIAL_STATE, loading: true };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('Returns the state for a login user request', () => {
      const action = { type: types.LOGIN_USER_REQUEST };
      const expectedState = { ...INITIAL_STATE, loading: true };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('Returns the state for a login with facebook request', () => {
      const action = { type: types.LOGIN_USER_FACEBOOK };
      const expectedState = { ...INITIAL_STATE, loading: true };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('Returns the state for a logout request', () => {
      const action = { type: types.LOGOUT_USER_REQUEST };
      const expectedState = { ...INITIAL_STATE, loading: true };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('Returns the state for a reset password request', () => {
      const state = 'Password request state';
      const action = {
        type: types.RESET_PASSWORD_REQUEST_SENT,
        payload: state
      };
      const expectedState = { ...INITIAL_STATE };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
  });

  describe('Success cases', () => {
    it('Returns the initial state when a user is successfully created', () => {
      const action = { type: types.CREATE_USER_SUCCESS };
      const expectedState = { ...INITIAL_STATE };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('Returns the initial state when a user logs in', () => {
      const action = { type: types.LOGIN_USER_SUCCESS };
      const expectedState = { ...INITIAL_STATE };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('Returns the initial state when a user logs out', () => {
      const action = { type: types.LOGOUT_USER_SUCCESS };
      const expectedState = { ...INITIAL_STATE };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('Returns the state for a reset password request when successful', () => {
      const state = 'Password request success state';
      const action = {
        type: types.RESET_PASSWORD_SUCCESS,
        payload: state
      };
      const expectedState = { ...INITIAL_STATE };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
  });

  describe('Failure cases', () => {
    it('Returns the state when user creation fails', () => {
      const error = 'User creation failed';
      const action = { type: types.CREATE_USER_FAILURE, payload: error };
      const expectedState = { ...INITIAL_STATE, error };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('Returns the state when login fails', () => {
      const error = 'Login failed';
      const action = { type: types.LOGIN_USER_FAILURE, payload: error };
      const expectedState = { ...INITIAL_STATE, error };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('Returns the state when logout fails', () => {
      const error = 'Logout failed';
      const action = { type: types.LOGOUT_USER_FAILURE, payload: error };
      const expectedState = { ...INITIAL_STATE, error };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('Returns the state for a reset password request if it fails', () => {
      const state = 'Password request failed state';
      const action = {
        type: types.RESET_PASSWORD_FAILURE,
        payload: state
      };
      const expectedState = { ...INITIAL_STATE };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
  });
});
