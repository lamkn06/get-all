import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import masterReducer from './masterSlice';
import moduleReducer from './moduleSlice';

export const createReducer = (injectedReducers = {}) =>
  combineReducers({
    user: userReducer,
    master: masterReducer,
    modules: moduleReducer,
    ...injectedReducers,
  });
