import React, { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { AuthNavigation, UnauthNavigation } from "~/constants/naviagtions";

const AuthScreen = (props) => {
  const { isAuth, isInitialed, handleInitialApp } = props;

  useEffect(() => {
    handleInitialApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isInitialed)
    return (
      <View style={styles.loadingContainerStyle}>
        <ActivityIndicator size="large" />
      </View>
    );

  return isAuth ? <AuthNavigation /> : <UnauthNavigation />;
};

const styles = StyleSheet.create({
  loadingContainerStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AuthScreen;
