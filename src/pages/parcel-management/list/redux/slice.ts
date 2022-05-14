import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrderProgressType, ParcelType, TableBaseType } from 'types';

export type OrderType = 'express' | 'food' | 'non-food';

export interface TableType extends TableBaseType {
  filter?: {
    keyword?: string;
    status?: OrderProgressType[];
    deliveryType?: OrderType;
    driverId?: string;
  };
}
export type TabsType = 'open-orders' | 'completed-orders';
export interface ParcelManagementState {
  currentParcel?: ParcelType;
  listParcels: ParcelType[];
  activeTab: TabsType;
  isEditing?: boolean;
  visible?: boolean;
  openOrders: TableType;
  completedOrders: TableType;
  driverOpenOrders?: string;
  driverCompletedOrders?: string;
}

const initialState: ParcelManagementState = {
  currentParcel: undefined,
  listParcels: [],
  activeTab: 'open-orders',
  openOrders: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    filter: {
      status: ['pending', 'assigned', 'for_pickup', 'picked_up', 'on_going'],
      deliveryType: 'express',
    },
  },
  completedOrders: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    filter: {
      status: ['delivered', 'canceled'],
      deliveryType: 'express',
    },
  },
};

const parcelSlice = createSlice({
  name: 'parcel-management',
  initialState,
  reducers: {
    setParcelList(state, action: PayloadAction<ParcelType[]>) {
      state.listParcels = action.payload;
    },
    setCurrentParcel(state, action: PayloadAction<ParcelType>) {
      state.currentParcel = action.payload;
    },
    setActiveTab(state, action: PayloadAction<TabsType>) {
      state.activeTab = action.payload;
    },
    setEditing(state, action: PayloadAction<boolean>) {
      state.isEditing = action.payload;
    },
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },
    setPagingOpenOrders(state, action: PayloadAction<TableType>) {
      state.openOrders = action.payload;
    },
    setPagingCompletedOrders(state, action: PayloadAction<TableType>) {
      state.completedOrders = action.payload;
    },
    setDriverOpenOrders(state, action: PayloadAction<string>) {
      state.driverOpenOrders = action.payload;
    },
    setDriverCompletedOrders(state, action: PayloadAction<string>) {
      state.driverCompletedOrders = action.payload;
    },
  },
});

export const {
  setParcelList,
  setCurrentParcel,
  setActiveTab,
  setEditing,
  setVisible,
  setPagingOpenOrders,
  setPagingCompletedOrders,
  setDriverOpenOrders,
  setDriverCompletedOrders,
} = parcelSlice.actions;

export default parcelSlice.reducer;
