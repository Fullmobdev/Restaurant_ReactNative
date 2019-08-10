import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from './global-settings.action';
import * as types from '../../types/global-settings.types';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// TODO: should dispatch a get global settings dispatch        
// TODO: should make a call to the right firebase url
// TODO: should dispatch success when it has data
// TODO: should dispatch error when there's some erro

describe('global settings actions', () => {
    let store;
    beforeEach(() => {
        store = mockStore();
    });

    describe('getGlobalSettings', () => {
        test('should dispatch a GET_GLOBAL_SETTINGS_REQUEST', () => {
            const expectedActions = [
                { type: types.GET_GLOBAL_SETTINGS_REQUEST }
            ];

            return store.dispatch(actions.getGlobalSettings())
            .then(() => {
                expect(store.getActions).toEqual(expectedActions);
            });
        });        
    });
});
