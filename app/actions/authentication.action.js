import moment from 'moment';
import _ from 'lodash';
import * as types from '../types/authentication.types';
import { FETCH_REVIEW_EXTENSION_BY_VIEWER_SUCCESS } from '../types/review.types';
import { RESET_UI_ERROR_VALUES, FORM_DATA_LOADING } from '../types/ui.types';
import { FETCH_BUSINESS_BOOKMARKS_SUCCESS } from '../types/business.types';
import * as service from '../services/authentication/authentication.service';
import * as fetchService from '../services/reviews/fetch-reviews.service';
import * as businessService from '../services/business/business.service';
/**
 * Login actions
 */

 const retrieveUserDetails = (firebaseUserCredentials) => {
   const user = firebaseUserCredentials.user;
   const { displayName, phoneNumber, providerData, providerId, uid, photoUrl, isAnonymous } = user;
  let email = user.email;
  let firstName = '';
  let lastName = '';
  if (displayName !== null) {
     firstName = displayName.split(' ')[0];
     lastName = displayName.split(' ')[1];
  }

  const provider = providerData.length > 0 ? providerData[0].providerId : providerId;
  const telephone = (phoneNumber === null) ? '' : phoneNumber;
  const countryCode = '';
  email = email || '';
  return { uid, email, firstName, lastName, telephone, countryCode, photoUrl, provider, isAnonymous };
};

export const loginUserAnonymously = () => {
  return (dispatch, getState) => {
    const { user } = getState();

    if (user && user.uid) {
      // Note: An already existing guest user continuing
      // as guest may cause potential issues
      return Promise.resolve();
    }
    
    loginUserRequest(dispatch);
    return new Promise((resolve, reject) => {
      service.logInAnonymously()
      .then((serviceResponse) => {
        const userDetails = retrieveUserDetails(serviceResponse);
        userDetails.firstName = 'Guest';
        userDetails.lastName = 'User';
        loadUserDefaults(dispatch, userDetails);
        loginGuestSuccess(dispatch, userDetails);
        resolve(userDetails);
      })
      .catch((error) => {
        reject(error);
      });
    });
  };
};

export const linkUserToAnonymousAccount = ({ 
  email, 
  firstName,
  lastName,
  password 
}) => {
  return dispatch => {
    loginUserRequest(dispatch);
    return new Promise((resolve, reject) => {
      service.linkUserToAnonymousAccount(email, password)
      .then((serviceResponse) => {
        service.sendUserVerificationMessage()
        .then(() => {
          const userDetails = retrieveUserDetails(serviceResponse);
          userDetails.firstName = firstName;
          userDetails.lastName = lastName;
          handleSuccessLogin(dispatch, userDetails)
          .then((user) => {
            resolve(user);
          })
          .catch((error) => {
            reject(error);
          });
        });
      })      
      .catch(error => {
        loginUserFailure(dispatch, error.message);
        reject(error);
      });
    });
  };
};

export const loginUser = ({ email, password }) => {
  return dispatch => {
    loginUserRequest(dispatch);

    return new Promise((resolve, reject) => {
      service.loginWithEmailAndPassword(email, password)
      .then((serviceResponse) => {
        const userDetails = retrieveUserDetails(serviceResponse);
        handleSuccessLogin(dispatch, userDetails)
        .then((user) => {
          resolve(user);
        })
        .catch((error) => {
          reject(error);
        });
      })
      .catch(error => {
        loginUserFailure(dispatch, error.message);
        reject(error);
      });
    });
  };
};

export const loginUserFacebook = () => {
  return (dispatch) => {
    loginUserFacebookRequest(dispatch);

    return new Promise((resolve, reject) => {
      service.loginFacebook()
      .then((serviceResponse) => {
        const userDetails = retrieveUserDetails(serviceResponse);
        handleSuccessLogin(dispatch, userDetails)
        .then((user) => {
          loginUserSuccess(dispatch, user);
          resolve(user);
        })
        .catch((error) => {
          reject(error);
        });
      })
      .catch(error => {
        if (error === types.LOGIN_USER_CANCELLED) {
            loginUserCancelled(dispatch);
        } else {
          loginUserFailure(dispatch, error.message);
          reject(error);
        }
      });
    });
  };
};

const handleSuccessLogin = (dispatch, userDetails) => {
  return new Promise((resolve, reject) => {
    const { uid } = userDetails;
    service.isUserProfileExists(uid)
    .then((profileExists) => {
      if (profileExists === true) {
        updateUserProfile(userDetails)
        .then((user) => {
          loginUserSuccess(dispatch, user);
          loadUserDefaults(dispatch, user)
          .then(() => {
            resolve(user);
          });
        })
        .catch((error) => {
          reject(error);
        });
      } else {
        createUserProfile(userDetails)
        .then((user) => {
          loginUserSuccess(dispatch, user);
          loadUserDefaults(dispatch, user)
          .then(() => {
            resolve(user);
          });
        })
        .catch((error) => {
          reject(error);
        });
      }
    })
    .catch((error) => {
      reject(error);
    });
});
};

export const loginAsGuest = (deviceDetails) => {
  return (dispatch) => {
    loginGuestSuccess(dispatch, deviceDetails);
  };
};

const loginGuestSuccess = (dispatch, deviceDetails) => {
  dispatch({ type: types.LOGIN_GUEST_SUCCESS, payload: deviceDetails });
};

const loginUserSuccess = (dispatch, user) => {
    dispatch({ type: types.LOGIN_USER_SUCCESS, payload: user });
};

/**
 * Get all default preferences for the user to enable a smoother experience
 */
export const loadUserDefaults = (dispatch, user) => {
  const { uid } = user;
  //what does this do? action not handled by any reducer
  dispatch({ type: types.LOAD_USER_DEFAULTS, payload: { userId: uid } });

  const promises = [];
  promises.push(fetchReviewExtention(dispatch, uid));
  promises.push(fetchUserBookmarks(dispatch, uid));

  return Promise.all(promises);
};

//Get all previoulsly viewed + liked reviews into the store
const fetchReviewExtention = (dispatch, uid) => {
  //Get all previoulsly viewed + liked reviews into the store 6e2fe91225fa7f4f7a5f10f3c4334ba75987d0bb
  return fetchService.fetchUserReviewExtension(uid)
  .once('value', snapshot => {
    const reviewExtensions = [];
    snapshot.forEach((data) => {
      const reviewId = data.key;
      const extn = data.val();
      Object.assign(extn, { reviewId });
      reviewExtensions.push(extn);
    });
    dispatch({ type: FETCH_REVIEW_EXTENSION_BY_VIEWER_SUCCESS, payload: reviewExtensions });
  });
};

//Get list of businesses bookmarked by user
const fetchUserBookmarks = (dispatch, uid) => {
  return businessService.fetchBookmarkedBusinesses(uid)
  .once('value', snapshot => {
    const bookmarks = [];
    snapshot.forEach((data) => {
      const businessId = data.key;
      const val = data.val();
      Object.assign(val, { businessId });
      bookmarks.push(val);
    });
    dispatch({ type: FETCH_BUSINESS_BOOKMARKS_SUCCESS, payload: bookmarks });
  });
};

const loginUserRequest = (dispatch) => {
  dispatch({ type: types.LOGIN_USER_REQUEST });
};

const loginUserFacebookRequest = (dispatch) => {
  dispatch({ type: types.LOGIN_USER_FACEBOOK });
};

const loginUserFailure = (dispatch, error) => {
  dispatch({ type: types.LOGIN_USER_FAILURE, payload: error });
};

const loginUserCancelled = (dispatch) => {
  dispatch({ type: types.LOGIN_USER_CANCELLED });
};

export const logoutUser = () => {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      logoutUserRequest(dispatch);

      service.logout()
      .then(() => {
        logoutUserSuccess(dispatch);
        resolve();
      })
      .catch(error => {
        loginUserFailure(dispatch, error.message);
        reject(error);
      });
    });
  };
};

const logoutUserSuccess = (dispatch) => {
  dispatch({ type: types.LOGOUT_USER_SUCCESS });
};

const logoutUserRequest = (dispatch) => {
  dispatch({ type: types.LOGOUT_USER_REQUEST });
};

export const resetErrorValues = () => {
  return (dispatch) => {
    dispatch({ type: RESET_UI_ERROR_VALUES });
  };
};

/**
 * Create account actions
 */
 export const createAccountPressed = () => {
   return { type: types.CREATE_ACCOUNT_PRESSED };
 };

export const nameFieldSubmitted = (firstName, lastName) => {
    return { type: types.NAME_FIELD_SUBMITTED, payload: { firstName, lastName } };
};

export const passwordFieldSubmitted = (password) => {
  return { type: types.PASSWORD_FIELD_SUBMITTED, payload: password };
};

export const emailFieldSubmitted = (email) => {
    return { type: types.EMAIL_FIELD_SUBMITTED, payload: email };
};

const createUserRequest = (dispatch) => {
  dispatch({ type: types.CREATE_USER_REQUEST });
};

const createUserFailure = () => {
  return { type: types.CREATE_USER_FAILURE };
};

const createUserSuccess = (user) => {
  return { type: types.CREATE_USER_SUCCESS, payload: user };
};

export const createUser = ({ email, password, firstName, lastName }) => {
  return (dispatch, getState) => {
    const { user } = getState();

    if (user && user.isAnonymous) {
      return dispatch(linkUserToAnonymousAccount({
        email,
        password,
        firstName,
        lastName
      }));
    }

    createUserRequest(dispatch);

    return new Promise((resolve, reject) => {
      service.createUserWithEmailAndPassword(email, password)
      .then((serviceResponse) => {
        service.sendUserVerificationMessage()
        .then(() => {
          const userDetails = retrieveUserDetails(serviceResponse);
          /*Override firebase defaults with input values from user*/
          /*This is only applicable during user creation*/
          userDetails.firstName = firstName;
          userDetails.lastName = lastName;
          handleSuccessLogin(dispatch, userDetails)
          .then((user) => {
            dispatch(createUserSuccess(user));
            resolve(user);
          })
          .catch((error) => {
            dispatch(createUserFailure());
            reject(error);
          });
        })
        .catch(error => {
          dispatch(createUserFailure());
          reject(error);
        });
      });
    });
  };
};

const updateUserProfile = (userDetails) => {
  return new Promise((resolve, reject) => {
    const { uid } = userDetails;
    service.retrieveUserProfile(uid)
    .then((userProfile) => {
      const path = `${uid}`;

      const currentTime = moment.utc().format();
      const lastLogin = { lastLogin: currentTime };

      service.updateData(lastLogin, path)
      .then(() => {
        resolve(userProfile);
      })
      .catch((error) => {
        reject(error);
      });
    })
    .catch((error) => {
      reject(error);
    });
  });
};


const createUserProfile = (userDetails) => {
  return new Promise((resolve, reject) => {
    const currentTime = moment.utc().format();
    const userProfile = {
      created: currentTime,
      lastLogin: currentTime
    };

    _.assign(userProfile, userDetails);

    const { uid } = userDetails;
    const path = `${uid}`;

    service.persistData(userProfile, path)
    .then(() => {
      resolve(userProfile);
    })
    .catch((error) => {
      reject(error);
    });
  });
};

/**
 * Password Reset Actions
 */
export const sendPasswordResetEmail = (email) => {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      service.sendPasswordResetEmail(email)
      .then((result) => {
        resetPasswordRequestSent(dispatch);
        resolve(result);
      })
      .catch((error) => {
        dispatch({ type: types.RESET_PASSWORD_FAILURE, payload: error.message });
        reject(error);
      });
    });
  };
};

export const retreiveUserProviders = (email) => (dispatch) =>
     new Promise((resolve, reject) => {
      service.fetchProvidersForEmail(email)
        .then((result) => {
          if (result.length > 0) {
              resolve(result);
              resetErrorValues();
          } else {
            resolve(types.ACCOUNT_NOT_AVAILABLE);
            resetErrorValues();
          }
        })
        .catch(() => {
          const msg = `Error occured while validating email ${email}`;
          reject(msg);
          resetErrorValues();
        });
    });

export const resetPasswordSuccess = () => {
  return (dispatch) => {
    dispatch({ type: types.RESET_PASSWORD_SUCCESS });
  };
};

const resetPasswordRequestSent = (dispatch) => {
    dispatch({ type: types.RESET_PASSWORD_REQUEST_SENT });
};

export const resetPasswordFailure = () => {
  return (dispatch) => {
    dispatch({ type: types.RESET_PASSWORD_FAILURE });
  };
};

export const forgotPasswordPressed = () => {
  return { type: types.FORGOT_PASSWORD_PRESSED };
};

const formDataLoading = () => {
  return { type: FORM_DATA_LOADING };
  };
