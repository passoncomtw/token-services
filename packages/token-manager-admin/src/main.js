import * as ReactDOM from 'react-dom/client';
import reduxStore from '~/store/configureStore';
import { Provider } from 'react-redux';
import 'reset-css';
import 'react-datepicker/dist/react-datepicker.css';
import MainScreen from '~/screens/MainScreen';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={reduxStore}>
    <MainScreen />
  </Provider>
);
