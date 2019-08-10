import {
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAILURE,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
  RESET_PASSWORD_REQUEST_SENT,
  LOGIN_USER_REQUEST,
  LOGIN_USER_FACEBOOK,
  LOGOUT_USER_REQUEST,
  LOGOUT_USER_FAILURE,
  LOGOUT_USER_SUCCESS,
  LOGIN_USER_FAILURE,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_CANCELLED,
  FORM_DATA_LOADING,
  LOGIN_GUEST_SUCCESS
} from '../../types/authentication.types';

import {
  ADD_REVIEWS_SUCCESS,
  CREATE_REVIEW_REQUEST,
  CREATE_REVIEW_SUCCESS,
  CREATE_REVIEW_FAILURE,
  FETCH_USER_REVIEWS_REQUEST,
  FETCH_USER_REVIEWS_SUCCESS,
  FETCH_USER_REVIEWS_FAILURE,
  FETCH_REVIEWS_REQUEST,
  FETCH_REVIEWS_SUCCESS,
  FETCH_REVIEWS_ERROR,
  ADD_USER_REVIEWS_SUCCESS,
  PROGRESS_BAR_DETAILS
} from '../../types/review.types';

import { USER_PROFILE_PIC_IS_UPDATING } from '../../types/users.types';
import {
  RESET_UI_ERROR_VALUES,
  REACT_NATIVE_ROUTER_FLUX_FOCUS,
  REACT_NATIVE_ROUTER_FLUX_RESET
} from '../../types/ui.types';
import timeline from '../../components/timeline/timeline.component';
import { LIKES_VIEWS_MODAL_SHOWN, LIKES_VIEWS_MODAL_CLOSED } from '../../types/likes-views-modal.types';
/**
 * This state used solely for keeping
 * track of local state in UI
 */
export const INITIAL_STATE = {
  createUserLoading: false,
  loginLoading: false,
  fbLoginLoading: false,
  reviewUploadLoading: false,
  previousTabIndex: 0,
  selectedTabIndex: 0,
  timelineLoading: false,
  profileLoading: false,
  profileCanLoadMore: {},
  progressBarDetails: null,
  error: '',
  isUserProfilePicUpdating: false,
  likesViewsModalShowing: false
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case USER_PROFILE_PIC_IS_UPDATING:
      return { ...state, isUserProfilePicUpdating: action.payload };
    case PROGRESS_BAR_DETAILS:
      return { ...state, progressBarDetails: action.payload };

    case ADD_REVIEWS_SUCCESS:
      return { ...state, timelineLoading: false };

    case LOGIN_USER_SUCCESS:
    case LOGIN_GUEST_SUCCESS:
      return { ...state, fbLoginLoading: false, loginLoading: false };
    case LOGOUT_USER_SUCCESS:
    case RESET_UI_ERROR_VALUES:
      return { ...state };

    case CREATE_USER_REQUEST:
      return { ...state, createUserLoading: true };

    case CREATE_USER_SUCCESS:
    case CREATE_USER_FAILURE:
      return { ...state, createUserLoading: false };

    case LOGIN_USER_FACEBOOK:
    case LOGOUT_USER_REQUEST:
    case FORM_DATA_LOADING:
      return { ...state, fbLoginLoading: true };

    case LOGIN_USER_REQUEST:
      return { ...state, loginLoading: true };

    case CREATE_REVIEW_REQUEST:
      return { ...state, reviewUploadLoading: true };

    case FETCH_REVIEWS_REQUEST:
      return { ...state, timelineLoading: true };

    case LOGOUT_USER_FAILURE:
    case LOGIN_USER_FAILURE:
    case CREATE_REVIEW_FAILURE:
    case FETCH_REVIEWS_ERROR:
      return { ...state, error: action.payload, timelineLoading: false, fbLoginLoading: false, loginLoading: false };

    case CREATE_REVIEW_SUCCESS:
      return { ...state, reviewUploadLoading: false };
    case RESET_PASSWORD_SUCCESS:
    case RESET_PASSWORD_FAILURE:
    case RESET_PASSWORD_REQUEST_SENT:
    case LOGIN_USER_CANCELLED:
    case FETCH_REVIEWS_SUCCESS:
      return { ...state, timelineLoading: false, loginLoading: false, fbLoginLoading: false };

    case REACT_NATIVE_ROUTER_FLUX_FOCUS:
      const { scene } = action;
      let currentSceneKey = state.currentSceneKey;
      const previousSceneKey = state.currentSceneKey;

      if (scene.type !== REACT_NATIVE_ROUTER_FLUX_RESET) {
        currentSceneKey = scene.sceneKey;
      }

      if (scene && scene.sceneKey === 'app' && scene.index !== state.selectedTabIndex) {
        return {
          ...state,
          currentSceneKey,
          previousSceneKey,
          previousTabIndex: state.selectedTabIndex,
          selectedTabIndex: scene.index
        };
      }
      return {
        ...state,
        previousSceneKey,
        currentSceneKey
      };

    case FETCH_USER_REVIEWS_REQUEST:
      return { ...state, profileLoading: true };

    case FETCH_USER_REVIEWS_SUCCESS:
      const { userId: fetchUserId, limit, reviews } = action.payload;
      let current = state.profileCanLoadMore[fetchUserId];
      current = current == null ? true : current;

      const canLoadMore = limit ? canLoadMoreReviews(limit, reviews.length) : current;
      const updatedProfileCanLoadMore = { ...state.profileCanLoadMore, [fetchUserId]: canLoadMore };

      return { ...state, profileLoading: false, profileCanLoadMore: updatedProfileCanLoadMore };

    case ADD_USER_REVIEWS_SUCCESS:
      const {
        userId: addUserId,
        limit: addSuccessLimit,
        reviews: addSuccessReviews
      } = action.payload;
      let currentStatus = state.profileCanLoadMore[addUserId];
      currentStatus = currentStatus == null ? true : currentStatus;

      const loadMore = addSuccessLimit
        ? canLoadMoreReviews(addSuccessLimit, addSuccessReviews.length)
        : currentStatus;
      const newProfileCanLoadMore = { ...state.profileCanLoadMore, [addUserId]: loadMore };

      return { ...state, profileCanLoadMore: newProfileCanLoadMore };

    case FETCH_USER_REVIEWS_FAILURE:
      return { ...state, profileLoading: false };

    case LIKES_VIEWS_MODAL_SHOWN: 
      return { ...state, likesViewsModalShowing: true };

    case LIKES_VIEWS_MODAL_CLOSED: 
      return { ...state, likesViewsModalShowing: false };

    default:
      return state;
  }
};

const canLoadMoreReviews = (limit, reviewsLength) => {
  return limit - 1 <= reviewsLength; //Duplicates are removed in fetchservice, hence subtract 1 from limit
};
