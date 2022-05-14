import { getAuth } from '@firebase/auth';
import { message } from 'antd';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { baseURL } from 'configs/baseURL';
import { useFirebaseApp } from 'reactfire';
import { getToken, setToken } from 'utils/localStorage';

declare module 'axios' {
  export interface AxiosRequestConfig {
    retry?: boolean;
  }
}

type ErrorResponse = {
  code: 401 | 404;
  message: 'token_expired' | 'User not found';
};

export const initiateAxios = () => {
  const firebaseApp = useFirebaseApp();
  const auth = getAuth(firebaseApp);

  axios.interceptors.request.use(
    (req: AxiosRequestConfig) => {
      const isAbsoluteURLRegex = /^(?:\w+:)\/\//;
      if (!isAbsoluteURLRegex.test(req.url)) req.url = baseURL + req.url;
      req.headers['Authorization'] = `Bearer ${getToken()}`;
      return req;
    },
    (err: AxiosError) => {
      return Promise.reject(err);
    },
  );

  axios.interceptors.response.use(
    (res: AxiosResponse) => {
      // Add configurations here
      return res;
    },
    async function (error: AxiosError<ErrorResponse>) {
      const originalRequest = error.config;
      const { message: errorMsg, code } = error.response.data;

      if (
        errorMsg &&
        errorMsg !== 'token_expired' &&
        code !== 404 &&
        code !== 401
      ) {
        message.error(errorMsg);
      }

      if (error.response.status === 401 && !originalRequest.retry) {
        originalRequest.retry = true;
        const accessToken = await auth.currentUser.getIdToken();
        setToken(accessToken);
        return axios(originalRequest);
      }
      return Promise.reject(error);
    },
  );
};
