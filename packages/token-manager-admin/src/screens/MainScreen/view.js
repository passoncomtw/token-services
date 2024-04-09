import React, { useEffect, useState } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import PrivateRoute from '~/components/PrivateRoute';
import PublicRoute from '~/components/PublicRoute';
import ErrorBoundary from '~/components/ErrorBoundary';
import LayoutWrapper from '~/components/LayoutWrapper';
import theme from '~/constants/theme';
import ErrorPage from '../ErrorPageScreen';
import LoginScreen from '../LoginScreen';
import AccountScreen from '../AccountScreen';
import RoleScreen from '../RoleScreen';
import UserListScreen from '../UserListScreen';
import UserAccountScreen from '../UserAccountScreen';
import CreateUserScreen from '../CreateUserScreen';
import OrdersScreen from '../OrdersScreen';
import PendingScreen from '../PendingScreen';
import BanksScreen from '../BanksScreen';
import HomeScreen from '../HomeScreen';
import UserDetailScreen from '../UserDetailScreen';

const MainScreen = props => {
  const { isAuth } = props;
  const [, setInitApp] = useState(false);

  useEffect(() => {
    setInitApp(true);
  }, [setInitApp]);

  return (
    <MuiThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        {/* ErrorBoundary had already in LayoutWrapper, not sure whether should put again or not? */}
        <ErrorBoundary>
          <Router>
            <LayoutWrapper>
              <Switch>
                <PublicRoute
                  exact
                  isAuth={isAuth}
                  path='/login'
                  component={LoginScreen}
                />
                <PrivateRoute
                  exact
                  path='/'
                  isAuth={isAuth}
                  component={HomeScreen}
                />
                <PrivateRoute
                  exact
                  path='/users/list'
                  isAuth={isAuth}
                  component={UserListScreen}
                />
                <PrivateRoute
                  exact
                  path='/users/list/:userId'
                  isAuth={isAuth}
                  component={UserDetailScreen}
                />
                <PrivateRoute
                  exact
                  path='/users/account'
                  isAuth={isAuth}
                  component={UserAccountScreen}
                />
                <PrivateRoute
                  exact
                  path='/users/add'
                  isAuth={isAuth}
                  component={CreateUserScreen}
                />
                <PrivateRoute
                  exact
                  path='/orders'
                  isAuth={isAuth}
                  component={OrdersScreen}
                />
                <PrivateRoute
                  exact
                  path='/pending'
                  isAuth={isAuth}
                  component={PendingScreen}
                />
                <PrivateRoute
                  exact
                  path='/banks'
                  isAuth={isAuth}
                  component={BanksScreen}
                />
                <PrivateRoute
                  exact
                  path='/user'
                  isAuth={isAuth}
                  component={AccountScreen}
                />
                <PrivateRoute
                  exact
                  path='/system/account'
                  isAuth={isAuth}
                  component={AccountScreen}
                />
                <PrivateRoute
                  exact
                  path='/system/role'
                  isAuth={isAuth}
                  component={RoleScreen}
                />
                <Route exact component={ErrorPage} />
              </Switch>
            </LayoutWrapper>
          </Router>
        </ErrorBoundary>
      </MuiPickersUtilsProvider>
    </MuiThemeProvider>
  );
};

export default MainScreen;
