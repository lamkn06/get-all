import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserType } from 'types';
import { getToken } from 'utils/localStorage';

export interface UserState extends Partial<UserType> {
  idToken?: string;
  photoURL?: string;
}

const initialState: UserState = {
  email: '',
  idToken: getToken(),
  role: undefined,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      return {
        ...action.payload,
        idToken: action.payload.idToken || state.idToken,
      };
    },
    setIdToken(state, action: PayloadAction<string>) {
      state.idToken = action.payload;
    },
  },
});

export const { setUser, setIdToken } = userSlice.actions;

export default userSlice.reducer;
