import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import HomeScreen from '~/screens/HomeScreen';
import LoginScreen from '~/screens/LoginScreen';
import AboutScreen from '~/screens/AboutScreen';
import UserScreen from '~/screens/UserScreen';
import BankCardModalScreen  from '../screens/BankCardModalScreen';
import HandleCardModalScreen from '../screens/HandleCardModalScreen';
import ConfirmOrderScreen from '~/screens/ConfirmOrderScreen';
import InitManagerItem from '~/screens/InitManagerItem';
import IntroductionScreen from '~/screens/IntroductionScreen';
import OrderScreen from '~/screens/OrderScreen';
import OrderDetailScreen from '~/screens/OrderDetailScreen';
import RegistryScreen from '~/screens/RegistryScreen';
import ResetPwdScreen from '~/screens/ResetPwdScreen';
import PendingScreen from '~/screens/PendingScreen';
import TransactionScreen from '~/screens/TransactionScreen';
import CreateOrderScreen from '~/screens/CreateOrderScreen';
import CreatePendingListScreen from '~/screens/CreatePendingListScreen';
import CreatePendingScreen from '~/screens/CreatePendingScreen';
import PasswordScreen from '../screens/PasswordScreen/view';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const WalletStackNavigator = () => (
  <Stack.Navigator>    
    <Stack.Screen
      name="Wallet-Home"
      component={HomeScreen}
      options={{
        headerTitle: '錢包',       
      }}
    />
    <Stack.Screen
      name="Wallet-Create-Order"
      component={CreateOrderScreen}
      options={{
        headerTitle: '錢包',       
      }}
    />
    <Stack.Screen
      name="Wallet-Bank-Card-Modal"
      component={BankCardModalScreen}
      options={{
        headerTitle: '收付方式',
      }}
    />
    <Stack.Screen
      name="Wallet-Handle-Card-Modal"
      component={HandleCardModalScreen}
      options={{
        headerTitle: '收付方式',
      }}
    />
  </Stack.Navigator>
);

const TransactionStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Transaction-Home"
      component={TransactionScreen}
      options={{
        headerTitle: '交易',       
      }}
    />
    <Stack.Screen
      name="Transaction-Create-Pending"
      component={CreatePendingScreen}
      options={{
        headerTitle: '掛單',       
      }}
    />
    <Stack.Screen
      name="Transaction-Create-Order"
      component={CreateOrderScreen}
      options={{
        headerTitle: '交易',       
      }}
    />
    <Stack.Screen
      name="Transaction-Order-Order-Detail"
      component={OrderDetailScreen}
      options={{
        headerTitle: '交易',       
      }}
    />
  </Stack.Navigator>
);

const SellOrderStackNavigator = () => (
  <Stack.Navigator>   
    <Stack.Screen
      name="Sell-Pending"
      component={PendingScreen}
      options={{
        headerTitle: '掛單',       
      }}
    />
     <Stack.Screen
      name="Sell-Create-Pending"
      component={CreatePendingScreen}
      options={{
        headerTitle: '掛單',       
      }}
    />
    <Stack.Screen
      name="Sell-Create-Pending-List"
      component={CreatePendingListScreen}
      options={{
        headerTitle: '掛單',       
      }}
    />
    <Stack.Screen
      name="Sell-Order-Order-Detail"
      component={OrderDetailScreen}
      options={{
        headerTitle: '賣掛單',       
      }}
    />
    <Stack.Screen
      name="Sell-Order-intro"
      component={IntroductionScreen}
      options={{
        headerTitle: '賣掛單',       
      }}
    />
    <Stack.Screen
      name="Sell-Order-init"
      component={InitManagerItem}
      options={{
        headerTitle: '賣掛單',       
      }}
    />
  </Stack.Navigator>
);

const BuyOrderStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Buy-Order-Home"
      component={OrderScreen}
      options={{
        headerTitle: '購買掛單',       
      }}
    />
    <Stack.Screen
      name="Buy-Order-Pending"
      component={CreatePendingScreen}
      options={{
        headerTitle: '掛單',       
      }}
    />
    <Stack.Screen
      name="Buy-Order-Order-Detail"
      component={OrderDetailScreen}
      options={{
        headerTitle: '賣掛單',       
      }}
    />
  </Stack.Navigator>
);

const SettingStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Setting-About"
      component={AboutScreen}
      options={{
        headerTitle: '關於我',       
      }}
    />
    <Stack.Screen
      name="Setting-User"
      component={UserScreen}
      options={{
        headerTitle: '關於我',       
      }}
    />
    <Stack.Screen
      name="Setting-Update-Password"
      component={PasswordScreen}
      options={{
        headerTitle: '修改密碼',       
      }}
    />
    <Stack.Screen
      name="Setting-Reset-Password"
      component={ResetPwdScreen}
      options={{
        headerTitle: '修改密碼',       
      }}
    />
  </Stack.Navigator>
);

export const AuthNavigation = () => (
  <Tab.Navigator>
    <Tab.Screen
        name="Wallet"
        component={WalletStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: '錢包',
          tabBarIcon: ({ focus, color }) => (
            <MaterialCommunityIcons name="wallet" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Transaction"
        component={TransactionStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: '交易',
          tabBarIcon: ({ focus, color }) => (
            <MaterialIcons name="attach-money" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Sell-Order"
        component={SellOrderStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: '掛單',
          tabBarIcon: ({ focus, color }) => (
            <MaterialCommunityIcons name="tooltip-plus-outline" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Buy-Order"
        component={BuyOrderStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: '訂單',
          tabBarIcon: ({ focus, color }) => (
            <MaterialCommunityIcons name="receipt" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Me"
        component={SettingStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: '關於我',
          tabBarIcon: ({ focus, color }) => (
            <MaterialCommunityIcons name="account-circle-outline" color={color} size={26} />
          ),
        }}
      />
  </Tab.Navigator>  
);

export const UnauthNavigation = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="ResetPWD" component={ResetPwdScreen} />
    <Stack.Screen name="Registry" component={RegistryScreen} />
  </Stack.Navigator>
);
