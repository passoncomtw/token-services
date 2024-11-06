import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import store from "~/store/configureStore";
import Toast from "react-native-toast-message";
import AuthScreen from "~/screens/AuthScreen";

export default function App() {
  return (
    <NavigationContainer>
      <Provider store={store}>
        <AuthScreen />
        <Toast />
      </Provider>
    </NavigationContainer>
  );
}
