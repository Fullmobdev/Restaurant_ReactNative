import Mixpanel from 'react-native-mixpanel';

import { EventNames, Properties } from './analytics-wrapper.constants';
import { REACT_NATIVE_ROUTER_FLUX_PUSH } from '../../types/scene.types';

Mixpanel.sharedInstanceWithToken('cb613545436bea9c985c6f16b518cbcf');

export const trackAccountCreation = (user) => {
    const {
        uid,
        created,
        email,
        firstName,
        lastLogin,
        lastName,
        provider,
        telephone
    } = user;
    const setOnceProperties = {
        [Properties.AccountProvider]: provider,
        [Properties.CreatedReservedKeyword]: created,
        [Properties.EmailReservedKeyword]: email,
        [Properties.FirstNameReservedKeyword]: firstName,
        [Properties.LastNameReservedKeyword]: lastName,
        [Properties.PhoneReservedKeyword]: telephone
    };

    Mixpanel.createAlias(uid);
    Mixpanel.track(EventNames.AccountCreated);
    Mixpanel.setOnce(setOnceProperties);
    Mixpanel.registerSuperPropertiesOnce(setOnceProperties);
};

export const trackLogin = (user) => {
    const { uid, created, lastLogin } = user;

    if (created === lastLogin) {
        trackAccountCreation(user);
        return;
    }
    const properties = { [Properties.LastLoggedIn]: lastLogin };

    Mixpanel.identify(uid);
    Mixpanel.track(EventNames.LoggedIn);
    Mixpanel.set(properties);
    Mixpanel.registerSuperProperties(properties);
};

export const trackGuestLogin = (props) => {
    const { uid, firstName, lastName } = props;
    const properties = {
        [Properties.FirstNameReservedKeyword]: firstName,
        [Properties.LastNameReservedKeyword]: lastName
    };

    Mixpanel.identify(uid);
    Mixpanel.track(EventNames.GuestLoggedIn);
    Mixpanel.set(properties);
    Mixpanel.registerSuperProperties(properties);
};

//TODO: get the length of the video if it's a video

export const trackMediaCaptured = (mediaMetadata) => {
    const { mediaType } = mediaMetadata;
    Mixpanel.trackWithProperties(EventNames.MediaCaptured, {
        [Properties.MediaType]: mediaType
    });
    Mixpanel.increment(Properties.NumOfMediaCaptured, 1);
};

export const trackReviewCreated = (review) => {
    const {
        apiId, businessCategory, businessId, businessName, currentTime,
        moment, numLikes, numViews, mediaType, reviewId, text, visitId
    } = review;

    Mixpanel.trackWithProperties(EventNames.ReviewCreated, {
        [Properties.PlaceId]: apiId,
        [Properties.BusinessCategory]: businessCategory,
        [Properties.BusinessId]: businessId,
        [Properties.BusinessName]: businessName,
        [Properties.Id]: reviewId,
        [Properties.MediaType]: mediaType,
        [Properties.Moment]: moment,
        [Properties.NumLikes]: numLikes,
        [Properties.NumViews]: numViews,
        [Properties.VisitId]: visitId,
        [Properties.CreatedReservedKeyword]: currentTime,
        [Properties.ReviewText]: text
    });
    Mixpanel.increment(Properties.NumOfReviewsCreated, 1);
};

export const trackSceneVisit = (scene) => {
    if (scene && scene.type === REACT_NATIVE_ROUTER_FLUX_PUSH) {
        Mixpanel.trackWithProperties(EventNames.SceneVisited, {
            [Properties.SceneName]: scene.name
        });
    }
};

export const trackUserRecommendation = (recommendationInfo) => {
    const { businessId, businessName, moment, recommendation } = recommendationInfo;

    Mixpanel.trackWithProperties(EventNames.UserRecommendation, {
        [Properties.BusinessId]: businessId,
        [Properties.BusinessName]: businessName,
        [Properties.Moment]: moment,
        [Properties.Recommendation]: recommendation
    });
};

export const bookmarkBusiness = (payload) => {
    const { businessId } = payload;

    Mixpanel.trackWithProperties(EventNames.BusinessBookmark, {
        [Properties.BusinessId]: businessId
    });
};

export const identifyUser = ({ userId }) => {
    Mixpanel.identify(userId);
};

export const trackTopReviewerClick = (user) => {
    const { firstName, lastName, uid } = user;

    Mixpanel.trackWithProperties(EventNames.TopReviewerClick, {
        [Properties.FirstName]: firstName,
        [Properties.LastName]: lastName,
        [Properties.UserId]: uid
    });
};

export const trackTopReviewerFollow = (reviewer) => {
    const { firstName, lastName, rank, uid } = reviewer;
    Mixpanel.trackWithProperties(EventNames.TopReviewerFollow, {
        [Properties.FirstName]: firstName,
        [Properties.LastName]: lastName,
        [Properties.UserId]: uid,
        [Properties.Rank]: rank
    });
};

export const trackTopReviewerUnfollow = (reviewer) => {
    const { firstName, lastName, rank, uid } = reviewer;
    Mixpanel.trackWithProperties(EventNames.TopReviewerUnfollow, {
        [Properties.FirstName]: firstName,
        [Properties.LastName]: lastName,
        [Properties.UserId]: uid,
        [Properties.Rank]: rank
    });
};

export const trackTimelineReviewClick = () => {
    Mixpanel.track(EventNames.TimelineReviewClick);
};

export const trackLikesViewsModalOpen = () => {
    Mixpanel.track(EventNames.LikesViewsModalOpen);
};

