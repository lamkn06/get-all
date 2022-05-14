import { ApplicationRootState } from 'types/index';
import { TypedUseSelectorHook, useSelector } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppSelector: TypedUseSelectorHook<ApplicationRootState> =
  useSelector;
