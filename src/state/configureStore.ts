import { configureStore } from '@reduxjs/toolkit';
import { createInjectorsEnhancer, forceReducerReload } from 'redux-injectors';
import { createReducer } from './configureReducers';

const configureAppStore = () => {
  const store = configureStore({
    reducer: createReducer(),
    enhancers: [
      createInjectorsEnhancer({
        createReducer,
        runSaga: () => {},
      }),
    ],
  });

  // Make reducers hot reloadable, see http://mxs.is/googmo
  // @ts-ignore
  if (module.hot) {
    // @ts-ignore
    module.hot.accept('./configureReducers', () => {
      forceReducerReload(store);
    });
  }

  return store;
};

const store = configureAppStore();
export default store;

export type AppDispatch = typeof store.dispatch;
