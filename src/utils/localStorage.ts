export const setToken = (value: string) =>
  localStorage.setItem('access_token', value);
export const getToken = () => localStorage.getItem('access_token') || '';
export const removeToken = () => localStorage.removeItem('access_token');
