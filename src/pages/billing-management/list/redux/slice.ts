import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BillingType } from 'types';
import { TableBaseType } from 'types/common';

interface TableType extends TableBaseType {
  filter?: {
    [key in 'keyword']?: string;
  };
}

export interface BillingManagementState {
  currentBilling: BillingType;
  isEditing: boolean;
  visible: boolean;
  table: TableType;
}

const initialState: BillingManagementState = {
  currentBilling: undefined,
  visible: false,
  isEditing: false,
  table: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    filter: {},
  },
};

const billingSlice = createSlice({
  name: 'billing-management',
  initialState,
  reducers: {
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },
    setEditing(state, action: PayloadAction<boolean>) {
      state.isEditing = action.payload;
    },
    setBilling(state, action: PayloadAction<BillingType>) {
      state.currentBilling = action.payload;
    },
    setTable(state, action: PayloadAction<TableType>) {
      state.table = action.payload;
    },
  },
});

export const { setVisible, setBilling, setTable, setEditing } =
  billingSlice.actions;

export default billingSlice.reducer;
