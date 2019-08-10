import { combineReducers } from 'redux';
import appStateReducer from '../reducers/app-state/app-state.reducer';
import businessReviewsReducer from '../reducers/review/business-reviews.reducer';
import userReducer from '../reducers/user/user.reducer';
import usersReducer from '../reducers/users/users.reducer';
import uiReducer from '../reducers/ui/ui.reducer';
import momentReducer from '../reducers/moments/moment.reducer';
import businessSearchReducer from '../reducers/business-search/business-search.reducer';
import businessReducer from '../reducers/business/business.reducer';
import reviewsReducer from '../reducers/review/reviews.reducer';
import visitsReducer from '../reducers/review/visits.reducer';
import discoverReducer from '../reducers/discover.reducer';
import followStatusesReducer from '../reducers/follow-statuses/follow-statuses.reducer';
import settingsReducer from '../reducers/global-settings/global-settings.reducer';
import pendingExperienceReducer from '../reducers/experience/pending-experience.reducer'

export default combineReducers({
  appState: appStateReducer,
  reviews: reviewsReducer,
  visits: visitsReducer,
  businessReviews: businessReviewsReducer,
  user: userReducer,
  users: usersReducer,
  ui: uiReducer,
  moment: momentReducer,
  businessSearch: businessSearchReducer,
  businesses: businessReducer,
  discover: discoverReducer,
  followStatuses: followStatusesReducer,
  pendingExperience: pendingExperienceReducer,
  settings: settingsReducer
});
