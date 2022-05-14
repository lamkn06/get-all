import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TableBaseType } from 'types';
import { RoleType } from 'types/role';

interface TableType extends TableBaseType {
  filter?: {
    [key in 'keyword' | 'status']?: string;
  };
}

export interface RoleManagementState {
  currentRole: RoleType;
  isEditing?: boolean;
  visible?: boolean;
  tablePagination: TableType;
  role: RoleType;
}

const initialState: RoleManagementState = {
  currentRole: undefined,
  isEditing: false,
  visible: false,
  tablePagination: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
  },
  role: undefined,
};

const roleManagement = createSlice({
  name: 'role-management',
  initialState,
  reducers: {
    setCurrentRole(state, action: PayloadAction<RoleType>) {
      state.currentRole = action.payload;
    },
    setEditing(state, action: PayloadAction<boolean>) {
      state.isEditing = action.payload;
    },
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },
    setTable(state, action: PayloadAction<TableType>) {
      state.tablePagination = action.payload;
    },
    setRoles(state, action: PayloadAction<RoleType>) {
      state.role = action.payload;
    },
  },
});

export const { setEditing, setVisible, setTable, setRoles, setCurrentRole } =
  roleManagement.actions;

export default roleManagement.reducer;
