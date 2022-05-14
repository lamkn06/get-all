import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DriverType, TableBaseType } from 'types';

interface TableType extends TableBaseType {
  filter?: {
    [key in
      | 'keyword'
      | 'driverId'
      | 'status'
      | 'driverStatus'
      | 'approvalStatus'
      | 'deliveryArea'
      | 'deliveryCluster'
      | 'driverGroup'
      | 'vehicleType']?: string | string[];
  };
}
export interface DriverManagementState {
  currentDriver?: DriverType;
  isEditing?: boolean;
  visible?: boolean;
  tableAll: TableType;
  tablePending: TableType;
}

const initialState: DriverManagementState = {
  currentDriver: undefined,
  isEditing: false,
  visible: false,
  tableAll: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    filter: {},
  },
  tablePending: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    filter: {
      approvalStatus: 'pending',
    },
  },
};

const driverSlice = createSlice({
  name: 'driver-management',
  initialState,
  reducers: {
    setCurrentDriver(state, action: PayloadAction<DriverType>) {
      state.currentDriver = action.payload;
    },
    setEditing(state, action: PayloadAction<boolean>) {
      state.isEditing = action.payload;
    },
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },
    setTableAll(state, action: PayloadAction<TableType>) {
      state.tableAll = action.payload;
    },
    setTablePending(state, action: PayloadAction<TableType>) {
      state.tablePending = action.payload;
    },
  },
});

export const {
  setCurrentDriver,
  setEditing,
  setVisible,
  setTableAll,
  setTablePending,
} = driverSlice.actions;

export default driverSlice.reducer;
