import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView } from "react-native";
import ErrorBoundary from "react-native-error-boundary";
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

const topBarOffsetIOS = 50;

const AppInnerContainer = () => {
  log.debug(`rendering AppInnerContainer`);

  const theme = useEffectiveTheme();

  const onError = (error: Error, stackTrace: string) => {
    log.error(stackTrace, error);
  };

  const internalContainer = (
    <AppInitializer>
      <SafeAreaView edges={safeAreaEdges} style={styles.container}>
        <AppStack />
      </SafeAreaView>
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
          <KeyboardAvoidingView
            behavior={Environment.isIOS ? "padding" : "height"}
            keyboardVerticalOffset={Environment.isIOS ? topBarOffsetIOS : 0}
            style={BaseStyles.flexOne}
          >
            {internalContainer}
          </KeyboardAvoidingView>
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
