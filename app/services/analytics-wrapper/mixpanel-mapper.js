// Action Types
import { 
    CREATE_USER_SUCCESS, 
    LOAD_USER_DEFAULTS, 
    LOGIN_USER_SUCCESS,
    LOGIN_GUEST_SUCCESS
} from '../../types/authentication.types';
import { MEDIA_CAPTURED } from '../../types/media.types';
import { CREATE_REVIEW_SUCCESS } from '../../types/review.types';
import { REACT_NATIVE_ROUTER_FLUX_FOCUS } from '../../types/scene.types';
import { 
    BOOKMARK_BUSINESS_SUCCESS, 
    SET_BUSINESS_USER_RECOMMENDATION_SUCCESS 
} from '../../types/business.types';
import { 
    TOP_REVIEWER_CLICK,
    TOP_REVIEWER_FOLLOW,
    TOP_REVIEWER_UNFOLLOW
} from '../../types/top-reviewers.types';

// Analytics methods 
import { 
    trackAccountCreation, 
    trackLogin, 
    trackMediaCaptured,
    trackReviewCreated,
    trackSceneVisit,
    trackUserRecommendation,
    identifyUser,
    bookmarkBusiness,
    trackGuestLogin,
    trackTimelineReviewClick,
    trackTopReviewerClick,
    trackTopReviewerFollow,
    trackTopReviewerUnfollow,
    trackLikesViewsModalOpen
} from './analytics-mixpanel-wrapper.service';
import { TIMELINE_REVIEW_CLICK } from '../../types/timeline.types';
import { LIKES_VIEWS_MODAL_SHOWN } from '../../types/likes-views-modal.types';

export default MixpanelMapper = {
    [CREATE_USER_SUCCESS]: trackAccountCreation,
    [LOGIN_USER_SUCCESS]: trackLogin,
    [MEDIA_CAPTURED]: trackMediaCaptured,
    [CREATE_REVIEW_SUCCESS]: trackReviewCreated,
    [REACT_NATIVE_ROUTER_FLUX_FOCUS]: trackSceneVisit,
    [SET_BUSINESS_USER_RECOMMENDATION_SUCCESS]: trackUserRecommendation,
    [BOOKMARK_BUSINESS_SUCCESS]: bookmarkBusiness,
    [LIKES_VIEWS_MODAL_SHOWN]: trackLikesViewsModalOpen,
    [LOGIN_GUEST_SUCCESS]: trackGuestLogin,
    [TIMELINE_REVIEW_CLICK]: trackTimelineReviewClick,
    [TOP_REVIEWER_CLICK]: trackTopReviewerClick,
    [TOP_REVIEWER_FOLLOW]: trackTopReviewerFollow,
    [TOP_REVIEWER_UNFOLLOW]: trackTopReviewerUnfollow
};
