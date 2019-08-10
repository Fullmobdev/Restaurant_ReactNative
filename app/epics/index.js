import { combineEpics } from 'redux-observable';

import { searchBusinessEpic } from './search-business.epic';

export const rootEpic = combineEpics(
    searchBusinessEpic
);
