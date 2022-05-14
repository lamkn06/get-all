import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TableBaseType } from 'types/common';
import { RateType } from 'types/rate';

interface TableType extends TableBaseType {
  filter?: {
    [key in 'keyword']?: string;
  };
}

export interface RateManagementState {
  currentRate: RateType;
  visible?: boolean;
  table: TableType;
}

const initialState: RateManagementState = {
  currentRate: undefined,
  visible: false,
  table: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    filter: {},
  },
};

const rateSlice = createSlice({
  name: 'rate-management',
  initialState,
  reducers: {
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },

    setRate(state, action: PayloadAction<RateType>) {
      state.currentRate = action.payload;
    },
    setTable(state, action: PayloadAction<TableType>) {
      state.table = action.payload;
    },
  },
});

export const { setVisible, setRate, setTable } = rateSlice.actions;

export default rateSlice.reducer;
