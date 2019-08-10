import { 
    TOP_REVIEWER_CLICK,
    TOP_REVIEWER_FOLLOW,
    TOP_REVIEWER_UNFOLLOW
} from '../../types/top-reviewers.types';

export const topReviewerClick = (payload) => {
    return {
        type: TOP_REVIEWER_CLICK,
        payload
    };
};

export const topReviewerFollow = (payload) => {
    return {
        type: TOP_REVIEWER_FOLLOW,
        payload
    };
};

export const topReviewerUnfollow = (payload) => {
    return {
        type: TOP_REVIEWER_UNFOLLOW,
        payload
    };
};
