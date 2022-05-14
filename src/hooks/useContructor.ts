import { useRef } from 'react';

export const useConstructor = (constructor: Function) => {
  const isConstructorCalled = useRef(false);
  if (!isConstructorCalled.current) {
    constructor();
    isConstructorCalled.current = true;
  }
};
