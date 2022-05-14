import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CampaignItem } from 'types/campaign';

export interface CampaignDetailManagementState {
  currentItem: CampaignItem;
  isEditing: boolean;
  visible: boolean;
}

const initialState: CampaignDetailManagementState = {
  currentItem: undefined,
  isEditing: false,
  visible: false,
};

const rateSlice = createSlice({
  name: 'campaign-detail',
  initialState,
  reducers: {
    setCampaignItem(state, action: PayloadAction<CampaignItem>) {
      state.currentItem = action.payload;
    },
    setEditing(state, action: PayloadAction<boolean>) {
      state.isEditing = action.payload;
    },

    setVisible(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    },
  },
});

export const { setEditing, setVisible, setCampaignItem } = rateSlice.actions;

export default rateSlice.reducer;
