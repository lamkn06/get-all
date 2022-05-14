import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryType, TableBaseType } from 'types';
import { AddonType } from 'types/addon';
import { ProductType } from 'types/product';

interface TableType extends TableBaseType {
  filter?: {
    [key in 'name' | 'status']?: string;
  };
}

export interface ProductManagementState {
  currentProduct: ProductType;
  productCategories: CategoryType[];
  productAddons: AddonType[];
  isEditing: boolean;
  visible: boolean;
  table: TableType;
  selectedCategory?: string;
}

const initialState: ProductManagementState = {
  currentProduct: undefined,
  productCategories: [],
  productAddons: [],
  isEditing: false,
  visible: false,
  table: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
  },
  selectedCategory: undefined,
};

const productManagement = createSlice({
  name: 'product-management',
  initialState,
  reducers: {
    setCurrentProduct(state, action: PayloadAction<ProductType>) {
      state.currentProduct = action.payload;
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
    setProductCategories(state, action: PayloadAction<CategoryType[]>) {
      state.productCategories = action.payload;
    },
    setProductAddons(state, action: PayloadAction<AddonType[]>) {
      state.productAddons = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
  },
});

export const {
  setTable,
  setCurrentProduct,
  setVisible,
  setEditing,
  setProductCategories,
  setProductAddons,
  setSelectedCategory,
} = productManagement.actions;

export default productManagement.reducer;
