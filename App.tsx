import { StatusBar } from "expo-status-bar";
import ErrorBoundary from "react-native-error-boundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from "react-native-keyboard-controller";
import {
  Edges,
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { Provider } from "react-redux";

import { AppConfirmDialog } from "appComponents/AppConfirmDialog";
import { AppMessageDialog } from "appComponents/AppMessageDialog";
import { AppToast } from "appComponents/AppToast";
import { ErrorFallbackComponent } from "appComponents/ErrorFallbackComponent";
import { JobMonitorDialog } from "appComponents/JobMonitorDialog";
import { useEffectiveTheme } from "hooks";
import { AppStack } from "navigation/AppStack";
import { store } from "state/store";
import { AppThemeProvider } from "theme";
import { BaseStyles, Environment, log, PreviewMode } from "utils";
import { initializeGlobalErrorHandler } from "utils/GlobalErrorHandler";

import { AppInitializer } from "./src/AppInitializer";
import { PreviewInitializer } from "./src/preview";
import styles from "./src/appStyles";

// registered as early as possible, before any rendering, to catch errors
// outside React's render phase (event handlers, timers, unhandled promise
// rejections) that the ErrorBoundary below cannot see
initializeGlobalErrorHandler();

const Initializer = PreviewMode.isActive ? PreviewInitializer : AppInitializer;

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
    <AppThemeProvider theme={theme}>
      <ErrorBoundary
        onError={onError}
        FallbackComponent={ErrorFallbackComponent}
      >
        <KeyboardProvider>
          <StatusBar style={theme.dark ? "light" : "dark"} />
          <Initializer>
            <SafeAreaView edges={safeAreaEdges} style={styles.container}>
              <KeyboardAvoidingView
                behavior={Environment.isIOS ? "padding" : "height"}
                keyboardVerticalOffset={keyboardVerticalOffset}
                style={BaseStyles.flexOne}
              >
                <AppStack />
              </KeyboardAvoidingView>
            </SafeAreaView>
          </Initializer>
        </KeyboardProvider>
      </ErrorBoundary>
      <AppMessageDialog />
      <AppConfirmDialog />
      <JobMonitorDialog />
      <AppToast />
    </AppThemeProvider>
  );
};

const App = () => {
  log.debug(`rendering App`);
  return (
    <GestureHandlerRootView style={BaseStyles.flexOne}>
      <SafeAreaProvider>
        <Provider store={store}>
          <AppInnerContainer />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
