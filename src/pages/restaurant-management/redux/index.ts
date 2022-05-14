import { combineReducers, createStore } from '@reduxjs/toolkit';

import restaurant from './restaurant';
import product from './product';

const reducers = createStore(
  combineReducers({
    restaurant,
    product,
  }),
);

export default reducers;
