import { createSlice } from '@reduxjs/toolkit';

interface Category {
  id: string;
  name: string;
}
interface Vehicle {
  id: string;
  name: string;
}

export interface MasterState {
  categories: Category[];
  vehicles: Vehicle[];
}

const initialState: MasterState = {
  categories: [
    {
      id: '1',
      name: 'Document',
    },
    {
      id: '2',
      name: 'Food',
    },
    {
      id: '3',
      name: 'Clothing',
    },
    {
      id: '4',
      name: 'Medical',
    },
  ],
  vehicles: [
    {
      id: '1',
      name: 'Motorcycle',
    },
    {
      id: '2',
      name: 'MPV300',
    },
  ],
};

const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {},
});

// eslint-disable-next-line no-empty-pattern
export const {} = masterSlice.actions;

export default masterSlice.reducer;
