import createSagaMiddleware from 'redux-saga';
import rootReducer from '../reducers';
import rootSaga from '../sagas';
import {
  startFetchingMiddleware,
  stopFetchingMiddleware,
} from '../middlewares/fetchingHandlerMiddleware';
import { authTokenMiddleware } from '../middlewares/authTokenMiddleware';
import { snackbarMiddleware } from '../middlewares/snackbarMiddleware';
import { createStore, applyMiddleware, compose } from 'redux';

const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware({});
  const middlewares = [
    startFetchingMiddleware,
    sagaMiddleware,
    stopFetchingMiddleware,
    authTokenMiddleware,
    snackbarMiddleware,
  ];

  const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(...middlewares))
  );

  sagaMiddleware.run(rootSaga);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers/index', () => {
      const nextRootReducer = require('../reducers/index');
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
};

const store = configureStore();

export default store;

export const getState = () => store.getState();
