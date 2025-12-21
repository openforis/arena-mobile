import { StatusBar } from "expo-status-bar";
import ErrorBoundary from "react-native-error-boundary";
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from "react-native-keyboard-controller";
import { Provider as PaperProvider, ThemeProvider } from "react-native-paper";
import { Edges, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";

import { AppConfirmDialog } from "appComponents/AppConfirmDialog";
import { AppMessageDialog } from "appComponents/AppMessageDialog";
import { AppToast } from "appComponents/AppToast";
import { ErrorFallbackComponent } from "appComponents/ErrorFallbackComponent";
import { JobMonitorDialog } from "appComponents/JobMonitorDialog";
import { useEffectiveTheme } from "hooks";
import { AppStack } from "navigation/AppStack";
import { store } from "state/store";
import { BaseStyles, Environment, log } from "utils";

import { AppInitializer } from "./src/AppInitializer";
import styles from "./src/appStyles";

const safeAreaEdges: Edges = ["right", "bottom", "left"];

/**
 * Vertical offset for KeyboardAvoidingView on iOS to account for the top bar (status bar + app header).
 * The value 50 was determined empirically to align input fields correctly beneath the top UI chrome on typical iOS devices.
 */
const topBarOffsetIOS = 50;

const AppInnerContainer = () => {
  log.debug(`rendering AppInnerContainer`);

  const theme = useEffectiveTheme();

  const onError = (error: Error, stackTrace: string) => {
    log.error(stackTrace, error);
  };

  const keyboardVerticalOffset = Environment.isIOS ? topBarOffsetIOS : 0;

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <ErrorBoundary
          onError={onError}
          FallbackComponent={ErrorFallbackComponent}
        >
          <KeyboardProvider>
            <StatusBar style={theme.dark ? "light" : "dark"} />
            <AppInitializer>
              <SafeAreaView edges={safeAreaEdges} style={styles.container}>
                <KeyboardAvoidingView
                  behavior={Environment.isIOS ? "padding" : "height"}
                  keyboardVerticalOffset={keyboardVerticalOffset}
                  style={BaseStyles.flexOne}
                >
                  <AppStack />
                </KeyboardAvoidingView>
              </SafeAreaView>
            </AppInitializer>
          </KeyboardProvider>
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
  log.debug(`rendering App`);
  return (
    <Provider store={store}>
      <AppInnerContainer />
    </Provider>
  );
};

export default App;
