import { combineReducers } from 'redux';

// Types
import { ADD_USER_REVIEWS_SUCCESS, FETCH_USER_REVIEWS_SUCCESS } from '../../types/review.types';
import { DESELECT_USER, LOAD_USER_AGGREGATES_SUCCESS, LOAD_USER_SUCCESS, SELECT_USER, USER_PROFILE_PIC_FETCHED, ADD_USER_TO_LIST } from '../../types/users.types';

const INITIAL_STATE = { userProfilePics: {}, usersList: {} };


const entries = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ADD_USER_TO_LIST:
            newList = state.usersList;
            newList[action.payload] = 1;
            return { ...state, usersList: newList };
        case USER_PROFILE_PIC_FETCHED: {
            const { uri, userId } = action.payload;
            if (uri !== '') {
            newUserProfilePics = state.userProfilePics;
            newUserProfilePics[userId] = uri;
            return { ...state, userProfilePics: newUserProfilePics };
            }
            return state;
        }
        case FETCH_USER_REVIEWS_SUCCESS:
            const { reviews: fetchSuccessVisits, userId: fetchSuccessUserId } = action.payload;

            let reviewsIds = [];

            fetchSuccessVisits.forEach(visit => {
                const { lastReviewCreatedTime, userIdLastReviewCreatedTime, visitId, ...rest } = visit;
                reviewsIds = reviewsIds.concat(Object.keys(rest));
            });

            if (!state[fetchSuccessUserId]) {
                const newState = { ...state, [fetchSuccessUserId]: { reviewsIds } };
                return newState;
            }

            const updatedUser = { ...state[fetchSuccessUserId], reviewsIds };
            return { ...state, [fetchSuccessUserId]: updatedUser };

        case ADD_USER_REVIEWS_SUCCESS:
            const { userId: addSuccessUserId, reviews: addSuccessVisits, toLocation } = action.payload;

            let newReviewsIds = [];
            let addSuccessReviewsIds = [];

            addSuccessVisits.forEach(visit => {
                const { lastReviewCreatedTime, userIdLastReviewCreatedTime, visitId, ...rest } = visit;
                newReviewsIds = newReviewsIds.concat(Object.keys(rest));
            });

            const currentReviewsIds = state[addSuccessUserId].reviewsIds;

            if (toLocation && toLocation === 'front') {
                addSuccessReviewsIds = [...newReviewsIds, ...currentReviewsIds];
            } else {
                addSuccessReviewsIds = [...currentReviewsIds, ...newReviewsIds];
            }

            const addSuccessUpdatedUser = { ...state[addSuccessUserId], reviewsIds: addSuccessReviewsIds };
            return { ...state, [addSuccessUserId]: addSuccessUpdatedUser };
        
        case LOAD_USER_AGGREGATES_SUCCESS: {
            const { aggregates, userId: aggregatesUserId } = action.payload;
            if (!aggregatesUserId) return state;

            const user = state[aggregatesUserId] || {};
            
            const newState = { 
                ...state, 
                [aggregatesUserId]: {
                    ...user,
                    aggregates
                } 
            };
            return newState;
        }
        case LOAD_USER_SUCCESS:
            const { userId: loadSuccessUserId, user: loadSuccessUser } = action.payload;
            let currentUser = state[loadSuccessUserId] || {};
            currentUser = { ...currentUser, ...loadSuccessUser };

            return { ...state, [loadSuccessUserId]: currentUser };

        default:
            return state;
    }
};



const selectedUser = (state = null, action) => {
    switch (action.type) {
        case SELECT_USER:
            return action.payload.userId;
        case   DESELECT_USER:
            return null;
        default:
            return state;
    }
};

export default combineReducers({
    byId: entries,
    selectedUser,

});
