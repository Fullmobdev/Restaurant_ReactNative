import reducer, { INITIAL_STATE } from './user.reducer';
import * as types from '../../types/authentication.types';

describe('User Reducer', () => {
  describe('Requests', () => {
    it('Has a default state', () => {
      const action = { type: 'unexpected' };
      const expectedState = {
              uid: '',
              firstName: '',
              lastName: '',
              email: '',
              telephone: '',
              countryCode: '',
              created: '',
              lastLogin: '',
              provider: '',
              photoUrl: '',
              userType: ''
      };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    it('Returns state for name field submitted', () => {
      const name = 'TEST_NAME';
      const action = { type: types.NAME_FIELD_SUBMITTED, payload: name };
      const { firstName, lastName } = action.payload;
      const expectedState = {
        ...INITIAL_STATE, firstName, lastName };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    it('Returns state for email field submitted', () => {
      const email = 'TEST_EMAIL@EMAIL.COM';
      const action = { type: types.EMAIL_FIELD_SUBMITTED, payload: email };
      const expectedState = { ...INITIAL_STATE, email: action.payload };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    it('Returns state for password field submitted', () => {
      const password = 'TEST_PASSWORD';
      const action = { type: types.PASSWORD_FIELD_SUBMITTED, payload: password };
      const expectedState = { ...INITIAL_STATE, password: action.payload };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    it('Returns state for login user failure', () => {
      const action = { type: types.LOGIN_USER_FAILURE };
      const expectedState = { ...INITIAL_STATE };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    it('Returns state for logout user success', () => {
      const action = { type: types.LOGOUT_USER_SUCCESS };
      const expectedState = { ...INITIAL_STATE };
      expect(reducer(undefined, action)).toEqual(expectedState);
    });
    // it('Returns state for create user success', () => {
    //   const userData = {
    //     id: '//TODO - get firebase id',
    //     createDate: '//TODO - get firebase date',
    //     profileId: '//TODO - get user profile id',
    //     userType: types.USER_TYPE
    //   }
    //   const action = { type: types.CREATE_USER_SUCCESS, payload: userData };
    //   const expectedState = { ...INITIAL_STATE, id: action.payload };
    //   expect(reducer(undefined, action)).toEqual(expectedState);
    // });
    // it('Returns state for login user success', () => {
    //   const userData = {
    //     id: '//TODO - get firebase id',
    //     createDate: '//TODO - get firebase date',
    //     profileId: '//TODO - get user profile id',
    //     userType: types.USER_TYPE
    //   }
    //   const action = { type: types.LOGIN_USER_SUCCESS, payload: userData };
    //   const expectedState = { ...INITIAL_STATE, id: action.payload };
    //   expect(reducer(undefined, action)).toEqual(expectedState);
    // });
  });
});
