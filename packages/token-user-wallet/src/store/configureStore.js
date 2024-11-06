import { Platform } from 'react-native';
import { composeWithDevTools } from 'remote-redux-devtools';
import { createStore, applyMiddleware, compose } from 'redux';
import { dialogHandlerMiddleware } from '~/middleware/dialogHandlerMiddleware';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '~/reducers';
import rootSaga from '~/sagas';

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware({});

  const middlewares = [
    sagaMiddleware,
    dialogHandlerMiddleware,
  ];

  const composeEnhancers = __DEV__ ? composeWithDevTools({ realtime: true, name: `token-wallet-app-${Platform.OS}`, port: 8000, hostname: "10.141.31.150" }) : compose;

  const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(...middlewares)),    
  );

  if (__DEV__) {
    module.hot.accept(() => {
      const nextRootReducer = require('../reducers/index').default;
      store.replaceReducer(nextRootReducer);
    });
  }
  return {
    ...store,
    runSaga: sagaMiddleware.run(rootSaga),
  };
};

const store = configureStore();

export default store;
