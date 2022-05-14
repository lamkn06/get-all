import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import firebaseConfig from 'configs/firebase';
import { FirebaseAppProvider } from 'reactfire';
import { Provider } from 'react-redux';
import App from './app';
import store from 'state/configureStore';

render(
  <FirebaseAppProvider firebaseConfig={firebaseConfig} suspense>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </FirebaseAppProvider>,
  document.getElementById('root'),
);

// @ts-ignore
if (module.hot && process.env.NODE_ENV === 'development') {
  // @ts-ignore
  module.hot.accept();
}
