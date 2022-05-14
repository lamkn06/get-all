import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RoleType, TableBaseType } from 'types';
import { UserType } from 'types/user';

interface TableType extends TableBaseType {
  filter?: {
    [key in 'keyword' | 'status']?: string;
  };
}

export interface UserManagementState {
  currentUser?: UserType;
  isEditing?: boolean;
  visible?: boolean;
  tablePagination: TableType;
  roles: RoleType[];
}

const initialState: UserManagementState = {
  currentUser: undefined,
  isEditing: false,
  visible: false,
  tablePagination: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
  },
  roles: [],
};

const userManagement = createSlice({
  name: 'user-management',
  initialState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<UserType>) {
      state.currentUser = action.payload;
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
    setRoles(state, action: PayloadAction<RoleType[]>) {
      state.roles = action.payload;
    },
  },
});

export const { setCurrentUser, setEditing, setVisible, setTable, setRoles } =
  userManagement.actions;

export default userManagement.reducer;
