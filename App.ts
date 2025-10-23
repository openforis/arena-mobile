import { configureStore } from "@reduxjs/toolkit";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView } from "react-native";
import ErrorBoundary from "react-native-error-boundary";
import { Provider as PaperProvider, ThemeProvider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";

// @ts-expect-error TS(2307): Cannot find module 'appComponents/AppConfirmDialog... Remove this comment to see the full error message
import { AppConfirmDialog } from "appComponents/AppConfirmDialog";
// @ts-expect-error TS(2307): Cannot find module 'appComponents/AppMessageDialog... Remove this comment to see the full error message
import { AppMessageDialog } from "appComponents/AppMessageDialog";
// @ts-expect-error TS(2307): Cannot find module 'appComponents/AppToast' or its... Remove this comment to see the full error message
import { AppToast } from "appComponents/AppToast";
// @ts-expect-error TS(2307): Cannot find module 'appComponents/ErrorFallbackCom... Remove this comment to see the full error message
import { ErrorFallbackComponent } from "appComponents/ErrorFallbackComponent";
// @ts-expect-error TS(2307): Cannot find module 'appComponents/JobMonitorDialog... Remove this comment to see the full error message
import { JobMonitorDialog } from "appComponents/JobMonitorDialog";
// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useEffectiveTheme } from "hooks";
// @ts-expect-error TS(2307): Cannot find module 'navigation/AppStack' or its co... Remove this comment to see the full error message
import { AppStack } from "navigation/AppStack";
// @ts-expect-error TS(2307): Cannot find module 'state/reducers' or its corresp... Remove this comment to see the full error message
import { rootReducer } from "state/reducers";
// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { BaseStyles, Environment } from "utils";

import { AppInitializer } from "./src/AppInitializer";
import styles from "./src/appStyles";

const store = configureStore({ reducer: rootReducer });

const safeAreaEdges = ["right", "bottom", "left"];

const AppInnerContainer = () => {
  if (__DEV__) {
    console.log(`rendering AppInnerContainer`);
  }
  const theme = useEffectiveTheme();

  const onError = (error: any, stackTrace: any) => {
    console.log(stackTrace, error);
  };

  const internalContainer = (
    // @ts-expect-error TS(2709): Cannot use namespace 'AppInitializer' as a type.
    <AppInitializer>
      // @ts-expect-error TS(2749): 'SafeAreaView' refers to a value, but is being use... Remove this comment to see the full error message
      <SafeAreaView edges={safeAreaEdges} style={styles.container}>
        <AppStack />
      </SafeAreaView>
    </AppInitializer>
  );

  return (
    <PaperProvider theme={theme}>
      // @ts-expect-error TS(7027): Unreachable code detected.
      <ThemeProvider theme={theme}>
        <ErrorBoundary
          // @ts-expect-error TS(2552): Cannot find name 'onError'. Did you mean 'Error'?
          onError={onError}
          // @ts-expect-error TS(2304): Cannot find name 'FallbackComponent'.
          FallbackComponent={ErrorFallbackComponent}
        >
          // @ts-expect-error TS(2749): 'StatusBar' refers to a value, but is being used a... Remove this comment to see the full error message
          <StatusBar style={theme.dark ? "light" : "dark"} />
          // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'KeyboardA... Remove this comment to see the full error message
          {Environment.isIOS ? (
            // @ts-expect-error TS(2304): Cannot find name 'behavior'.
            <KeyboardAvoidingView behavior="height" style={BaseStyles.flexOne}>
              // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
              {internalContainer}
            </KeyboardAvoidingView>
          ) : (
            // @ts-expect-error TS(2304): Cannot find name 'internalContainer'.
            internalContainer
          )}
        // @ts-expect-error TS(2365): Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2749): 'Provider' refers to a value, but is being used as... Remove this comment to see the full error message
    <Provider store={store}>
      // @ts-expect-error TS(2749): 'AppInnerContainer' refers to a value, but is bein... Remove this comment to see the full error message
      <AppInnerContainer />
    </Provider>
  );
};

export default App;
