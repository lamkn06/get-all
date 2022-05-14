import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TableBaseType } from 'types';
import { AddonType } from 'types/addon';

interface TableType extends TableBaseType {
  filter?: {
    [key in 'name' | 'type']?: string;
  };
}

export interface AddonManagementState {
  currentAddon: AddonType;
  isEditing: boolean;
  visible: boolean;
  table: TableType;
}

const initialState: AddonManagementState = {
  currentAddon: undefined,
  isEditing: false,
  visible: false,
  table: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
  },
};

const addonManagement = createSlice({
  name: 'addon-management',
  initialState,
  reducers: {
    setCurrentAddon(state, action: PayloadAction<AddonType>) {
      state.currentAddon = action.payload;
    },
    setTable(state, action: PayloadAction<TableType>) {
      state.table = action.payload;
    },
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },
    setEditing(state, action: PayloadAction<boolean>) {
      state.isEditing = action.payload;
    },
  },
});

export const { setTable, setCurrentAddon, setVisible, setEditing } =
  addonManagement.actions;

export default addonManagement.reducer;
