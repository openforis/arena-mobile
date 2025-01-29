import React from "react";
import { KeyboardAvoidingView } from "react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { Provider as PaperProvider, ThemeProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import ErrorBoundary from "react-native-error-boundary";

import { AppConfirmDialog } from "appComponents/AppConfirmDialog";
import { AppMessageDialog } from "appComponents/AppMessageDialog";
import { JobMonitorDialog } from "appComponents/JobMonitorDialog";
import { AppToast } from "appComponents/AppToast";
import { ErrorFallbackComponent } from "appComponents/ErrorFallbackComponent";

import { AppStack } from "navigation/AppStack";
import { rootReducer } from "state/reducers";
import { useEffectiveTheme } from "hooks";
import { BaseStyles, Environment } from "utils";

import { AppInitializer } from "./src/AppInitializer";

const store = configureStore({ reducer: rootReducer });

const AppInnerContainer = () => {
  if (__DEV__) {
    console.log(`rendering AppInnerContainer`);
  }
  const theme = useEffectiveTheme();

  const onError = (error, stackTrace) => {
    console.log(stackTrace, error);
  };

  const internalContainer = (
    <AppInitializer>
      <AppStack />
    </AppInitializer>
  );

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <ErrorBoundary
          onError={onError}
          FallbackComponent={ErrorFallbackComponent}
        >
          <StatusBar style={theme.dark ? "light" : "dark"} />
          {Environment.isIOS ? (
            <KeyboardAvoidingView behavior="height" style={BaseStyles.flexOne}>
              {internalContainer}
            </KeyboardAvoidingView>
          ) : (
            internalContainer
          )}
        </ErrorBoundary>
        <AppMessageDialog />
        <AppConfirmDialog />
        <JobMonitorDialog />
        <AppToast />
      </ThemeProvider>
    </PaperProvider>
  );
};

const App = () => {
  if (__DEV__) {
    console.log(`rendering App`);
  }
  return (
    <Provider store={store}>
      <AppInnerContainer />
    </Provider>
  );
};

export default App;
