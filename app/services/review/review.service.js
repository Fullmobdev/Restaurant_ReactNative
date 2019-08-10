import firebase from 'react-native-firebase';
import moment from 'moment';
import * as DBService from '../../services/db-access.service';
import { BUSINESS_REVIEWS_PATH }
from '../../services/review/review-endpoints';

const NUMBER_OF_LIKES = 'numLikes';
const NUMBER_OF_VIEWS = 'numViews';

/**
 * Detatches the listners currently attached to firebase for specific businesses
 * @param {String} businessId
 * @param {String} businessCategory
 */
export const detatchReviewsListner = (businessId, businessCategory) => {
  if (businessId) {
    const path = `${BUSINESS_REVIEWS_PATH}/${businessCategory}/${businessId}`;
    DBService.getDatabaseReferenceByPath(path).off();
  }
};

export const incrementLikes = (path) => {
  const ref = firebase.database().ref(path).child(NUMBER_OF_LIKES);
  return ref.transaction(numLikes => {
    if (numLikes) {
      numLikes += 1;
    } else {
      numLikes = 1;
    }
    return numLikes;
  });
};

export const incrementLikesNew = (path) => {
    const ref = firebase.database().ref(path).child(NUMBER_OF_LIKES);
    return ref.transaction(numLikes => {
      if (numLikes) {
        numLikes += 1;
      } else {
        numLikes = 1;
      }
      return numLikes;
    });
};

export const decrementLikes = (path) => {
  const ref = firebase.database().ref(path).child(NUMBER_OF_LIKES);
  return ref.transaction(numLikes => {
    if (numLikes) {
      numLikes -= 1;
    } else {
      numLikes = 0;
    }
    return numLikes;
  });
};

export const incrementViews = (path) => {
  const ref = firebase.database().ref(path).child(NUMBER_OF_VIEWS);
  return ref.transaction(numViews => {
    if (numViews) {
      numViews += 1;
    } else {
      numViews = 1;
    }
    return numViews;
  });
};

//TODO - this should run a query using time instead of downloading the data and then filtering
//THIS IS NOT EFFICIENT AT ALL!
export const getVisitId = (path) => {
  return new Promise((resolve, reject) => {
    let visitId = null;
    const currentTime = moment(moment.utc().format());
    firebase.database().ref().child(path)
      .orderByKey()
      .limitToLast(1)
      .once('value')
      .then((dataSnapshot) => {
          if (dataSnapshot.exists()) {
            dataSnapshot.forEach(snapshot => {
              lastReviewCreatedTime = snapshot.val().lastReviewCreatedTime;
              const duration = moment.duration(currentTime.diff(moment(lastReviewCreatedTime)));
              const elapsedHours = duration.asHours();
              if (elapsedHours >= 0 && elapsedHours <= 24) { // Last review was less than a day ago, so use thesame visitId
                visitId = snapshot.key;
              }
            });
          }
          resolve(visitId);
      })
      .catch((error) => {
        reject(error); // or resolve null?
      });
  });
};
