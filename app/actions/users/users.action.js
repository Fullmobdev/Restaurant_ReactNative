// Types
import {
    LOAD_USER_REQUEST,
    LOAD_USER_SUCCESS,
    LOAD_USER_FAILURE,
    LOAD_USER_ADDRESS_REQUEST,
    LOAD_USER_ADDRESS_SUCCESS,
    LOAD_USER_ADDRESS_FAILURE,
    LOAD_USER_AGGREGATES_REQUEST,
    LOAD_USER_AGGREGATES_SUCCESS,
    LOAD_USER_AGGREGATES_FAILURE,
    LOAD_USER_REWARDS_REQUEST,
    LOAD_USER_REWARDS_SUCCESS,
    USER_REWARDS_UPDATE,
    SELECT_USER,
    DESELECT_USER,
    USER_PROFILE_PIC_UPDATE,
    USER_PROFILE_PIC_FETCHED,
    ADD_USER_TO_LIST,
    USER_PROFILE_PIC_IS_UPDATING
} from '../../types/users.types';

// Services
import {
    fetchUser,
    fetchUserRewards,
    watchUserRewards,
    fetchAggregatesForUser
} from '../../services/user/user.service';
import { getAddressFromLocation } from '../../services/location/location.service';

export const userProfilePicUpdating = (payload) => {
  return (dispatch) => {
    dispatch({
      type: USER_PROFILE_PIC_IS_UPDATING,
      payload
    });
  };
};

export const userProfilePicUpdate = (payload) => {
const uri = `data:image/jpeg;base64,${payload}`;
return (dispatch) => {
  dispatch({
    type: USER_PROFILE_PIC_UPDATE,
    payload: uri
  });
};
};

export const loadUser = (payload) => {
    return (dispatch, getState) => {
        const { userId } = payload;
        const { users } = getState();
        
        if (users[userId]) return;
        
        dispatch(loadUserRequest(userId));

        fetchUser(payload.userId)
        .then(user => {
            dispatch(loadUserSuccess({
                userId,
                user
            }));
        })
        .catch(() => {
            dispatch(loadUserFailure({ userId }));
        });
    };
};

export const loadUserRewards = () => {
    return (dispatch, getState) => {
        const { user } = getState();
        const userId = user.uid;
        dispatch(loadUserRewardsRequest());

        fetchUserRewards(userId)
        .then(rewardsActivity => {
            dispatch(loadUserRewardsSuccess({ rewardsActivity }));
        });

        dispatch(watchUserRewardsUpdate(userId));
    };
};

export const loadUserLocationAddress = (location) => {
    return (dispatch) => {
        dispatch(loadUserAddressRequest());

        getAddressFromLocation(location)
        .then(addressResult => {
            dispatch(loadUserAddressSuccess(addressResult));
        })
        .catch(error => {
            dispatch(loadUserAddressFailure(error));
        });
    };
};

export const loadUserAggregates = (userId) => {
    //TODO: Don't go fetch if we already have it in the store
    // if the userId belongs to logged in user since we'll persist 
    // to disk
    return dispatch => {
        dispatch(loadUserAggregatesRequest(userId));

        fetchAggregatesForUser(userId)
        .then(aggregatesSnapshot => {
            if (aggregatesSnapshot) {
                const payload = {
                    aggregates: aggregatesSnapshot.val(),
                    userId,
                };
                dispatch(loadUserAggregatesSuccess(payload));
            } else {
                dispatch(loadUserAggregatesFailure());
            }
        })
        .catch(err => {
            dispatch(loadUserAggregatesFailure());
        });
    };
};

const loadUserAggregatesRequest = (userId) => {
    return {
        type: LOAD_USER_AGGREGATES_REQUEST,
        payload: { userId }
    };
};

const loadUserAggregatesSuccess = (payload) => {
    return {
        type: LOAD_USER_AGGREGATES_SUCCESS,
        payload
    };
};

const loadUserAggregatesFailure = () => {
    return {
        type: LOAD_USER_AGGREGATES_FAILURE
    };
};

const loadUserAddressRequest = (address) => {
    return {
        type: LOAD_USER_ADDRESS_REQUEST,
        payload: { address }
    };
};

const loadUserAddressSuccess = (address) => {
    return {
        type: LOAD_USER_ADDRESS_SUCCESS,
        payload: { address }
    };
};

const loadUserAddressFailure = (error) => {
    return {
        type: LOAD_USER_ADDRESS_FAILURE,
        payload: error
    };
};

const watchUserRewardsUpdate = (userId) => {
    return dispatch => {
        watchUserRewards(userId)
        .on('child_changed', snapshot => {
            const review = snapshot.key;
            const activity = snapshot.toJSON();
            dispatch(userRewardsUpdate({ review, activity }));
        });
    };
};

export const loadUserRequest = (payload) => {
    return {
        type: LOAD_USER_REQUEST,
        payload
    };
};

export const loadUserSuccess = (payload) => {
    return {
        type: LOAD_USER_SUCCESS,
        payload
    };
};

export const loadUserFailure = (payload) => {
    return {
        type: LOAD_USER_FAILURE,
        payload
    };
};

const loadUserRewardsRequest = () => {
    return {
        type: LOAD_USER_REWARDS_REQUEST
    };
};

const loadUserRewardsSuccess = (payload) => {
    return {
        type: LOAD_USER_REWARDS_SUCCESS,
        payload
    };
};

const userRewardsUpdate = (payload) => {
    return {
        type: USER_REWARDS_UPDATE,
        payload
    };
};

export const deselectUser = () => {
    return {
        type: DESELECT_USER
    };
};

export const selectUser = (payload) => {
    return {
        type: SELECT_USER,
        payload
    };
};
export const addUserToList = (userId) => {
  return {
        type: ADD_USER_TO_LIST,
        payload: userId
      };
};

export const fetchUserProfilePicture = (userId) => {
return (dispatch) => {
    fetchUser(userId)
    .then((user) => {
        dispatch({
          type: USER_PROFILE_PIC_FETCHED,
          payload: { userId, uri: user.photoUrl }
        });
    });
};
};
