import 'jest';
import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from './authentication.action';
import * as types from '../types/authentication.types';
import * as service from '../services/authentication/authentication.service';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Login Actions', () => {
  afterEach(() => {
    service.loginWithEmailAndPassword.restore();
  });

  it('Successfully logs in user', () => {
    sinon.stub(service, 'loginWithEmailAndPassword')
    .returns(new Promise((resolve, reject) => {
      resolve({ email: 'e', password: 'p' });
    }));

    const expectedActions = [
      { type: types.LOGIN_USER_REQUEST },
      { type: types.LOGIN_USER_SUCCESS, payload: { email: 'e', password: 'p' } }
    ];
    const store = mockStore({});
    return store.dispatch(actions.loginUser({ email: 'email@gmail.com', password: 'password' }))
    .then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('Fails to log in user', () => {
    sinon.stub(service, 'loginWithEmailAndPassword')
    .returns(new Promise((resolve, reject) => {
      reject({ message: 'error message' });
    }));

    const expectedActions = [
      { type: types.LOGIN_USER_REQUEST },
      { type: types.LOGIN_USER_FAILURE, payload: 'error message' }
    ];
    const store = mockStore({});
    return store.dispatch(actions.loginUser({ email: 'email@gmail.com', password: 'password' }))
    .catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('Facebook Login Actions', () => {
  afterEach(() => {
    service.loginFacebook.restore();
  });

  it('logs the user in with Facebook', () => {
    sinon.stub(service, 'loginFacebook')
    .returns(new Promise((resolve, reject) => {
      resolve({ user: 'John Smith' });
    }));

    const expectedActions = [
      { type: types.LOGIN_USER_FACEBOOK },
      { type: types.LOGIN_USER_SUCCESS, payload: { user: 'John Smith' } }
    ];
    const store = mockStore({});
    return store.dispatch(actions.loginUserFacebook())
    .then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('Fails to log in the user with facebook ', () => {
    sinon.stub(service, 'loginFacebook')
    .returns(new Promise((resolve, reject) => {
      reject({ message: 'error message' });
    }));

    const expectedActions = [
      { type: types.LOGIN_USER_FACEBOOK },
      { type: types.LOGIN_USER_FAILURE, payload: 'error message' }
    ];
    const store = mockStore({});
    return store.dispatch(actions.loginUserFacebook())
    .catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('logout actions', () => {
  afterEach(() => {
    service.logout.restore();
  });

  it('logs out the user', () => {
    sinon.stub(service, 'logout')
    .returns(new Promise((resolve) => {
      resolve();
    }));

    const expectedActions = [
      { type: types.LOGOUT_USER_REQUEST },
      { type: types.LOGOUT_USER_SUCCESS }
    ];
    const store = mockStore({});
    return store.dispatch(actions.logoutUser())
    .then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('forgot password actions', () => {
  afterEach(() => {
    service.sendPasswordResetEmail.restore();
  });

  it('sends a password reset email via firebase', () => {
    sinon.stub(service, 'sendPasswordResetEmail')
    .returns(new Promise((resolve, reject) => {
      resolve({ result: 'sent' });
    }));

    const expectedActions = [
      { type: types.RESET_PASSWORD_REQUEST_SENT },
    ];
    const store = mockStore({});
    return store.dispatch(actions.sendPasswordResetEmail('email@gmail.com'))
    .then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('handles a failed firebase reset email request', () => {
    sinon.stub(service, 'sendPasswordResetEmail')
    .returns(new Promise((resolve, reject) => {
      reject({ message: 'error message' });
    }));

    const expectedActions = [
      { type: types.RESET_PASSWORD_FAILURE, payload: 'error message' },
    ];
    const store = mockStore({});
    return store.dispatch(actions.sendPasswordResetEmail('email@gmail.com'))
    .catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
