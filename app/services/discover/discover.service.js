import firebase from 'react-native-firebase';
import { 
  DISCOVER_PATH,
  TOP_REVIEWER_PATH 
} from './discover-endpoints';

export const fetchDiscoverData = () => {
  return firebase.database().ref(DISCOVER_PATH);
};

export const watchTopReviewersForUpdates = () => {
  return firebase.database().ref(TOP_REVIEWER_PATH);
};
