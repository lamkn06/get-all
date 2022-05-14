import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomerType, TableBaseType } from 'types';

interface TableType extends TableBaseType {
  filter?: {
    [key in 'status' | 'billing' | 'type' | 'keyword']?: string | string[];
  };
}
export interface CustomerManagementState {
  currentCustomer?: CustomerType;
  listCustomers?: CustomerType[];
  isEditing?: boolean;
  visible?: boolean;
  pagination: TableType;
}

const initialState: CustomerManagementState = {
  currentCustomer: undefined,
  isEditing: false,
  visible: false,
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    filter: {},
  },
};

const customerSlice = createSlice({
  name: 'customer-management',
  initialState,
  reducers: {
    setCurrentCustomer(state, action: PayloadAction<CustomerType>) {
      state.currentCustomer = action.payload;
    },
    setListCustomer(state, action: PayloadAction<CustomerType[]>) {
      state.listCustomers = action.payload;
    },
    setEditing(state, action: PayloadAction<boolean>) {
      state.isEditing = action.payload;
    },
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },
    setPagination(state, action: PayloadAction<TableType>) {
      state.pagination = action.payload;
    },
  },
});

export const {
  setCurrentCustomer,
  setEditing,
  setVisible,
  setPagination,
  setListCustomer,
} = customerSlice.actions;

export default customerSlice.reducer;
