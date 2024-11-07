import { Platform } from 'react-native';
import { createStore, applyMiddleware, compose } from 'redux';
import { dialogHandlerMiddleware } from '~/middleware/dialogHandlerMiddleware';
import { composeWithDevTools } from '@redux-devtools/remote';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '~/reducers';
import rootSaga from '~/sagas';
import 'react-native-get-random-values';

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware({});

  const middlewares = [
    sagaMiddleware,
    dialogHandlerMiddleware,
  ];

  const composeEnhancers = __DEV__ ? composeWithDevTools({ hostname: 'localhost', realtime: true, port: 8000 }) : compose;

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
