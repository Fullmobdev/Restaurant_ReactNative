import { AsyncStorage } from 'react-native';
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { persistReducer } from 'redux-persist';
import ReduxThunk from 'redux-thunk';


import { rootEpic } from './app/epics/index';
import reducers from './app/reducers';
import ViewsAnalyticsMiddleware from './app/middleware/views-analytics.middleware';

// Once more reducers are added, we need to change loginFormReducer
// With a more generic reducer that combines all the reducers
// (via 'combineReducers')
const reduxPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user']
};

const persistedReducer = persistReducer(reduxPersistConfig, reducers);

export default function configureStore() {
  const epicMiddleware = createEpicMiddleware(rootEpic);
  const middlewares = [ReduxThunk, epicMiddleware, ViewsAnalyticsMiddleware];

  const store = createStore(
    persistedReducer,
    {},
    applyMiddleware(...middlewares)
  );

  return store; 
}
