import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CategoryType,
  FoodOrderType,
  OrderProgressType,
  RestaurantType,
  TableBaseType,
} from 'types';
import { OrderType } from 'pages/parcel-management/list/redux/slice';

interface TableType extends TableBaseType {
  filter?: {
    [key in 'name' | 'brandName' | 'status']?: string;
  };
}

export type FoodStatusType =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'for_delivery'
  | 'in_transit'
  | 'for_pickup'
  | 'picked_up'
  | 'delivered'
  | 'canceled';

export interface OrdersTableType extends TableBaseType {
  filter?: {
    keyword?: string;
    status?: FoodStatusType[];
    deliveryType?: OrderType;
    driverId?: string;
    orderCode?: string;
    pickupOnly?: string;
  };
}

export interface RestaurantManagementState {
  listOpenOrders: FoodOrderType[];
  listCompletedOrders: FoodOrderType[];
  pagination: TableType;
  currentRestaurant: RestaurantType;
  restaurantCategories: CategoryType[];
  openOrdersPagination: OrdersTableType;
  completedOrdersPagination: OrdersTableType;
  selectedCategory?: string;
}

const initialState: RestaurantManagementState = {
  listOpenOrders: [],
  listCompletedOrders: [],
  currentRestaurant: undefined,
  restaurantCategories: [],
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
  },
  openOrdersPagination: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    filter: {
      status: [
        'pending',
        'accepted',
        'preparing',
        'ready',
        'for_delivery',
        'in_transit',
        'for_pickup',
        'picked_up',
      ],
    },
  },
  completedOrdersPagination: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    filter: {
      status: ['delivered', 'canceled'],
    },
  },
  selectedCategory: undefined,
};

const restaurantManagement = createSlice({
  name: 'restaurant-management',
  initialState,
  reducers: {
    setCurrentRestaurant(state, action: PayloadAction<RestaurantType>) {
      state.currentRestaurant = action.payload;
    },
    setRestaurantCategories(state, action: PayloadAction<CategoryType[]>) {
      state.restaurantCategories = action.payload;
    },
    setPagination(state, action: PayloadAction<TableType>) {
      state.pagination = action.payload;
    },
    setOpenOrders(state, action: PayloadAction<FoodOrderType[]>) {
      state.listOpenOrders = action.payload;
    },
    setCompletedOrders(state, action: PayloadAction<FoodOrderType[]>) {
      state.listCompletedOrders = action.payload;
    },
    setPagingOpenOrders(state, action: PayloadAction<OrdersTableType>) {
      state.openOrdersPagination = action.payload;
    },
    setPagingCompletedOrders(state, action: PayloadAction<OrdersTableType>) {
      state.completedOrdersPagination = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<string | undefined>) {
      state.selectedCategory = action.payload;
    },
  },
});

export const {
  setCurrentRestaurant,
  setRestaurantCategories,
  setPagingOpenOrders,
  setPagingCompletedOrders,
  setOpenOrders,
  setCompletedOrders,
  setPagination,
  setSelectedCategory,
} = restaurantManagement.actions;

export default restaurantManagement.reducer;
