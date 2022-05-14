import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TableBaseType } from 'types';
import { CampaignType } from 'types/campaign';

interface TableType extends TableBaseType {
  filter?: {
    [key in 'keyword' | 'status']?: string;
  };
}

export interface CampaignManagementState {
  currentCampaign: CampaignType;
  isEditing?: boolean;
  visible?: boolean;
  tablePagination: TableType;
  campaign: CampaignType;
}

const initialState: CampaignManagementState = {
  currentCampaign: undefined,
  isEditing: false,
  visible: false,
  tablePagination: {
    pageIndex: 1,
    pageSize: 10,
    total: 0,
  },
  campaign: undefined,
};

const campaignManagement = createSlice({
  name: 'campaign-management',
  initialState,
  reducers: {
    setCurrentCampaign(state, action: PayloadAction<CampaignType>) {
      state.currentCampaign = action.payload;
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
  },
});

export const { setEditing, setVisible, setTable, setCurrentCampaign } =
  campaignManagement.actions;

export default campaignManagement.reducer;
