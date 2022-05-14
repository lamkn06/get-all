import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TableBaseType } from 'types/common';
import { FoodRateType } from 'types/foodRate';

interface TableType extends TableBaseType {
  filter?: {
    [key in 'keyword']?: string;
  };
}

export interface FoodRateManagementState {
  currentFoodRate: FoodRateType;
  visible?: boolean;
  isEditing: boolean;
  table: TableType;
}

const initialState: FoodRateManagementState = {
  currentFoodRate: undefined,
  visible: false,
  isEditing: false,
  table: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    filter: {},
  },
};

const foodRateSlice = createSlice({
  name: 'food-rate-management',
  initialState,
  reducers: {
    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },
    setFoodRate(state, action: PayloadAction<FoodRateType>) {
      state.currentFoodRate = action.payload;
    },
    setTable(state, action: PayloadAction<TableType>) {
      state.table = action.payload;
    },
    setEditing(state, action: PayloadAction<boolean>) {
      state.isEditing = action.payload;
    },
  },
});

export const { setVisible, setFoodRate, setTable, setEditing } =
  foodRateSlice.actions;

export default foodRateSlice.reducer;
