import firebase from 'react-native-firebase';
import moment from 'moment';
import * as DBService from '../db-access.service';
import { AGGREGATES_BY_USER_PATH } from '../../services/review/review-endpoints';
import {
  USER_PATH,
  USER_REWARDS_PATH
} from './user.endpoints';
// /app/aggregatesByUser
//      { sumReviews: ..., sumRecommendations: ..., (sumViews: ...)}

//create sum
// sum += 1 when review is added
// reviews + recommends
// review creation also adds businessName, businessCoords,  [DONE]

const SUM_REVIEWS = 'sumReviews';
const SUM_RECCOMENDS = 'sumRecommends';

export const uploadUserProfilePictureToFirebase = (data, userId) => {
  const uri = `data:image/jpeg;base64,${data}`;
  return DBService.saveData(uri, `app/Users/${userId}/photoUrl`);
};

export const fetchUser = userId => {
  return firebase
    .database()
    .ref(USER_PATH)
    .child(userId)
    .once('value')
    .then(snapshot => {
      return snapshot.val();
    });
};

export const fetchUserRewards = userId => {
  const path = `${USER_REWARDS_PATH}/${userId}`;

  return firebase
  .database()
  .ref(path)
  .once('value')
  .then(snapshot => {
    return snapshot.toJSON();
  });
};

export const watchUserRewards = userId => {
  const path = `${USER_REWARDS_PATH}/${userId}`;

  return firebase
  .database()
  .ref(path);
};

export const incrementAggregateReviews = (userId, existingVisit) => {
  const path = `${AGGREGATES_BY_USER_PATH}/${userId}`;
  const ref = firebase
    .database()
    .ref(path);

  return ref.transaction(aggregates => {
    aggregates = aggregates || {};

    if (aggregates.sumReviews) {
      aggregates.sumReviews += 1;
    } else {
      aggregates.sumReviews = 1;
    }

    if (!aggregates.topReviewerScore) {
      aggregates.topReviewerScore = {
        lastUpdated: new Date().toISOString(),
        score: 1
      };
    } else if (!existingVisit) {
      const dateStr = new Date().toISOString(); 
      aggregates.topReviewerScore = {
        lastUpdated: dateStr,
        score: moment(aggregates.topReviewerScore.lastUpdated).week() === moment(dateStr).week() ? (aggregates.topReviewerScore.score + 1) : 1
      };
    }

    return aggregates;
  });
};

export const incrementAggregateRecommends = userId => {
  const path = `${AGGREGATES_BY_USER_PATH}/${userId}`;
  const ref = firebase
    .database()
    .ref(path)
    .child(SUM_RECCOMENDS);
  return ref.transaction(recommendSum => {
    if (recommendSum) {
      recommendSum += 1;
    } else {
      recommendSum = 1;
    }
    return recommendSum;
  });
};

export const decrementAggregateRecommends = userId => {
  const path = `${AGGREGATES_BY_USER_PATH}/${userId}`;
  const ref = firebase
    .database()
    .ref(path)
    .child(SUM_RECCOMENDS);
  return ref.transaction(recommendSum => {
    if (recommendSum) {
      recommendSum -= 1;
    } else {
      recommendSum = 1;
    }
    return recommendSum;
  });
};

export const fetchAggregatesForUser = userId => {
  const path = `${AGGREGATES_BY_USER_PATH}/${userId}`;
  return firebase.database().ref(path).once('value');
};
