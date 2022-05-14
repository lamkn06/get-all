import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TableBaseType } from 'types';
import { VoucherType } from 'types/voucher';

interface TableType extends TableBaseType {
  filter?: {
    [key in 'keyword' | 'status']?: string;
  };
}

export interface VoucherManagementState {
  currentVoucher?: VoucherType;
  isEditing?: boolean;
  visible?: boolean;
  tablePagination: TableType;
}

const initialState: VoucherManagementState = {
  currentVoucher: undefined,
  isEditing: false,
  visible: false,
  tablePagination: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
  },
};

const voucherManagement = createSlice({
  name: 'voucher-management',
  initialState,
  reducers: {
    setCurrentVoucher(state, action: PayloadAction<VoucherType>) {
      state.currentVoucher = action.payload;
    },
    setEditing(state, action: PayloadAction<boolean>) {
      state.isEditing = action.payload;
    },
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },
    setPagination(state, action: PayloadAction<TableType>) {
      state.tablePagination = action.payload;
    },
  },
});

export const { setCurrentVoucher, setEditing, setVisible, setPagination } =
  voucherManagement.actions;

export default voucherManagement.reducer;
