import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModuleType } from 'types/module';

export interface ModuleState {
  modules: ModuleType[];
}

const initialState: ModuleState = {
  modules: [],
};

const moduleSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    setModules(state, action: PayloadAction<ModuleType[]>) {
      state.modules = action.payload;
    },
  },
});

export const { setModules } = moduleSlice.actions;

export default moduleSlice.reducer;
