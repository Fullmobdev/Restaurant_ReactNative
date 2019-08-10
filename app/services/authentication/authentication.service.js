import firebase from 'react-native-firebase';
import { LoginManager, AccessToken, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import RNFetchBlob from 'react-native-fetch-blob';
import * as types from '../../types/authentication.types';
import * as DBService from '../../services/db-access.service';
import { uploadUserProfilePictureToFirebase } from '../user/user.service';
import { userProfilePicUpdating, userProfilePicUpdate } from '../../actions/users/users.action';

const USER_BASE_PATH = 'app/Users';

/**
* Check if user profile already exists
* @param {String} uid
*/
export const isUserProfileExists = (uid) => {
  return new Promise((resolve, reject) => {
    DBService.getDatabaseReferenceByPathAndChild(USER_BASE_PATH, uid).once('value')
    .then((snapshot) => {
      resolve(snapshot.val() !== null);
    })
    .catch(() => {
      reject(false);
    });
  });
};

/**
 * Retrieve users profile information from firebase
 * @param {String} uid
 */
export const retrieveUserProfile = (uid) => {
  return new Promise((resolve, reject) => {
    DBService.getDatabaseReferenceByPathAndChild(USER_BASE_PATH, uid).once('value')
    .then((snapshot) => {
      resolve(snapshot.val());
    })
    .catch((error) => {
      reject(error);
    });
  });
};

const fetchProfilePicFromFacebook = (accessToken, userId) => {
   const graphRequest = new GraphRequest('/me', {
    accessToken,
    parameters: {
      fields: {
        string: 'picture.type(large)',
      },
    },
  }, (error, result) => {
    if (error) {
      console.error(error);
    } else {
      userProfilePicUpdating(true);
      const url = result.picture.data.url;
      fetchProfilePicFromUrl(url)
      .then((response) => {
          return uploadUserProfilePictureToFirebase(response.data, userId)
          .then((res) => {
            userProfilePicUpdate(response.data);
            userProfilePicUpdating(false);
          })
          .catch((err) => {
              userProfilePicUpdating(false);
              console.log(err);
          });
      });
    }
  });
  new GraphRequestManager().addRequest(graphRequest).start();
};

const fetchProfilePicFromUrl = (url) => {
  return RNFetchBlob.fetch('GET', url);
};
/**
 * Signs the user into firebase with the current facebook access token.
 * This should be called after the user has accepted our request to
 * access his or her data from Facebook.
 */
const firebaseFacebookTokenLogin = () => {
  return new Promise((resolve, reject) => {
      AccessToken.getCurrentAccessToken()
      .then((accessTokenData) => {
        const token = firebase.auth.FacebookAuthProvider.credential(accessTokenData.accessToken);
        return firebase.auth().signInWithCredential(token)
        .then(firebaseUserCredential => {
            const uid = firebaseUserCredential.user.uid;
            fetchProfilePicFromFacebook(accessTokenData.accessToken, uid);
            resolve(firebaseUserCredential);
          })
        .catch(error => {
            reject(error);
          });
        });
      });
    };


/**
 * Login/Sign up with Facebook
 *
 * Uses the firebaseFacebookTokenLogin function to attempt to log the user
 * into firebase with the given readPermissions
 *
 * (Calling this function will cause the Facebook SDK to
 * present the Facebook login page)
 */
export const loginFacebook = () => {
  //The data we are asking the user to allow us to access
  const readPermissions = ['public_profile', 'email'];

  return new Promise((resolve, reject) => {
    LoginManager.logInWithReadPermissions(readPermissions)
    .then(result => {
      if (!result.isCancelled) {
        firebaseFacebookTokenLogin()
        .then(user => resolve(user))
        .catch(error => reject(error));
      } else {
        result = types.LOGIN_USER_CANCELLED;
        reject(result);
      }
    }).catch(error => reject(error));
  });
};

/**
  * Account Creation Services
  * Below functions are used to facilitate creation of
  * accounts for new users.
  */

export const createUserWithEmailAndPassword = (email = '', password = '') => {
  return firebase.auth().createUserAndRetrieveDataWithEmailAndPassword(email, password);
};

export const fetchProvidersForEmail = (email = '') => {
  return firebase.auth().fetchSignInMethodsForEmail(email);
};

export const sendUserVerificationMessage = () => {
  return getCurrentUser().sendEmailVerification();
};

export const getCurrentUser = () => {
  return firebase.auth().currentUser;
};

export const logInAnonymously = () => {
  return firebase.auth().signInAnonymously();
};

export const linkUserToAnonymousAccount = (email, password) => {
  const credential = firebase.auth.EmailAuthProvider.credential(email, password);
  return getCurrentUser().linkWithCredential(credential);
};
/**
  * Log user into firebase with provided email and password
  * @param {String} email
  * @param {String} password
  */
export const loginWithEmailAndPassword = (email = '', password = '') => {
  return firebase.auth().signInAndRetrieveDataWithEmailAndPassword(email, password);
};

/**
 * Logout user from firebase
 */
export const logout = () => {
  return firebase.auth().signOut();
};

/**
 * Send email to user with specified email address
 * @param {String} email
 */
export const sendPasswordResetEmail = (email) => {
  return firebase.auth().sendPasswordResetEmail(email);
};

/**
* Update data in firebase in path specified
* Create new data entry if attributes does not exist
* @param {object} data {attr1: xxx, attr2: xxx}
* @param {String} path
*/
export const updateData = (data, path) => {
  return new Promise((resolve, reject) => {
    const userPath = `${USER_BASE_PATH}/${path}`;
    DBService.getDatabaseReferenceByPath(userPath).update(data)
    .then(() => {
      resolve();
    })
    .catch((error) => {
      reject(error);
    });
  });
};

/**
* Create new data entry in firebase
* @param {object} data {attr1: xxx, attr2: xxx}
* @param {String} path
*/
export const persistData = (data, path) => {
  return new Promise((resolve, reject) => {
    const userPath = `${USER_BASE_PATH}/${path}`;
    DBService.getDatabaseReferenceByPath(userPath).set(data)
    .then(() => {
      resolve();
    })
    .catch((error) => {
      reject(error);
    });
  });
};
