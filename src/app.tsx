/* eslint-disable no-console */
import 'antd/dist/antd.css';
import 'app.scss';
import 'moment-timezone';
import { getAuth, onAuthStateChanged, onIdTokenChanged } from '@firebase/auth';
import { nanoid } from '@reduxjs/toolkit';
import { Spin } from 'antd';
import DashboardLayout from 'components/templates/dashboard-layout';
import UnAuthorizedLayout from 'components/templates/unauthorized-layout';
import { PATHS } from 'constants/paths';
import { getFirestore } from 'firebase/firestore';
import { isAccreditationPage } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { useConstructor } from 'hooks/useContructor';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useDispatch } from 'react-redux';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  AuthProvider,
  FirestoreProvider,
  useFirebaseApp,
  useInitPerformance,
} from 'reactfire';
import { flattenRoutes, unauthorizedRoutes } from 'routes';
import { setUser } from 'state/userSlice';
import { initiateAxios } from 'utils/axiosInstance';
import { getToken, setToken } from 'utils/localStorage';
import { RecoilRoot } from 'recoil';
import { setModules } from 'state/moduleSlice';
import commonService from 'api/common.api';
import moduleService from 'api/modules.api';

const AppLayout: React.FC = ({ children }) => {
  const { idToken: authenticated } = useAppSelector(state => state.user);
  return authenticated && !isAccreditationPage ? (
    <DashboardLayout>{children}</DashboardLayout>
  ) : (
    <UnAuthorizedLayout>{children}</UnAuthorizedLayout>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 2000,
      cacheTime: 2000,
    },
  },
});

const App: React.FC = () => {
  const firebaseApp = useFirebaseApp();

  const firestoreInstance = getFirestore(useFirebaseApp());

  const auth = getAuth(firebaseApp);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);

  useInitPerformance(
    async firebaseApp => {
      const { getPerformance } = await import('firebase/performance');
      return getPerformance(firebaseApp);
    },
    { suspense: false }, // false because we don't want to stop render while we wait for perf
  );

  useEffect(() => {
    onAuthStateChanged(auth, async user => {
      if (!user && !isAccreditationPage) {
        navigate(PATHS.Login);
        return;
      }
      await updateIdToken();
    });

    onIdTokenChanged(auth, async user => {
      if (user) {
        setToken((user as any).accessToken);
        await Promise.all([updateIdToken(), fetchModules(), fetchMe()]);
      }
    });
  }, []);

  const updateIdToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    setToken(token);
    dispatch(
      setUser({
        id: nanoid(),
        idToken: token,
      }),
    );
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const { data: user } = await commonService.me();
      setRoles(user.role.roleAccesses.map(access => access.module.key));
      dispatch(
        setUser({
          id: nanoid(),
          ...user,
        }),
      );
    } catch (error) {
      throw error;
    }
  }, []);

  const fetchModules = useCallback(async () => {
    try {
      const { data: modules } = await moduleService.getList();
      dispatch(setModules(modules));
    } catch (error) {
      throw error;
    }
  }, []);

  useConstructor(() => {
    if (getToken()) {
      navigate(location.pathname);
    }
    initiateAxios();
  });

  return (
    <RecoilRoot>
      <AuthProvider sdk={auth}>
        <FirestoreProvider sdk={firestoreInstance}>
          <QueryClientProvider client={queryClient}>
            <AppLayout>
              <Suspense fallback={<Spin className="app__spin" size="large" />}>
                <Routes>
                  {flattenRoutes
                    .filter(route => {
                      if (route.key === 'all') {
                        return true;
                      }

                      return roles.includes(route.key);
                    })
                    .map(route => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={route.component}
                      />
                    ))}
                  {unauthorizedRoutes.map(route => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={route.component}
                    />
                  ))}
                  <Route
                    path="/"
                    element={<Navigate to={PATHS.Home} replace />}
                  />
                </Routes>
              </Suspense>
            </AppLayout>
          </QueryClientProvider>
        </FirestoreProvider>
      </AuthProvider>
    </RecoilRoot>
  );
};

export default App;
