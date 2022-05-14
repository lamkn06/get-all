import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomerType } from 'types';
import { RateFareType } from 'types/rate';

export interface RateDetailManagementState {
  rateFare: RateFareType;
  isEditing: boolean;
  visible: boolean;
  appliedCustomers?: CustomerType[];
}

const initialState: RateDetailManagementState = {
  rateFare: undefined,
  isEditing: false,
  visible: false,
  appliedCustomers: undefined,
};

const rateSlice = createSlice({
  name: 'rate-detail',
  initialState,
  reducers: {
    setRateFare(state, action: PayloadAction<RateFareType>) {
      state.rateFare = action.payload;
    },
    setEditing(state, action: PayloadAction<boolean>) {
      state.isEditing = action.payload;
    },
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },

    setAppliedCustomers(state, action: PayloadAction<CustomerType[]>) {
      state.appliedCustomers = action.payload;
    },
  },
});

export const { setEditing, setVisible, setRateFare, setAppliedCustomers } =
  rateSlice.actions;

export default rateSlice.reducer;
