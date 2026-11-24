import type { ErrorUtils as ErrorUtilsType } from "react-native";

import { MessageActions } from "state/message";
import { store } from "state/store";

import { Errors } from "./Errors";
import { log } from "./Logger";

// React Native / Hermes globals not (or loosely) declared in the RN types
type AppGlobal = {
  ErrorUtils?: ErrorUtilsType;
  HermesInternal?: {
    enablePromiseRejectionTracker?: (options: {
      allRejections: boolean;
      onHandled: () => void;
      onUnhandled: (id: number, rejection: unknown) => void;
    }) => void;
  } | null;
  [initializedFlagKey]?: boolean;
};

const appGlobal = global as unknown as AppGlobal;

const globalErrorUtils = appGlobal.ErrorUtils;

// tracked on the actual JS global (not module-local state), since a module-local
// flag would be reset if this module gets re-evaluated by Fast Refresh; without
// this, every dev hot reload would wrap another layer around the previous
// handler, duplicating dialogs/log entries for every subsequent error
const initializedFlagKey = "__arenaMobileGlobalErrorHandlerInitialized__";

const showErrorMessage = (error: unknown) => {
  store.dispatch(
    MessageActions.setMessage({
      content: "common:somethingWentWrong",
      contentParams: { error: Errors.getErrorMessage(error) },
      details: error instanceof Error ? error.stack : undefined,
      title: "common:error",
    }),
  );
};

const handleGlobalError = (error: unknown, isFatal?: boolean) => {
  try {
    log.error(
      `Unhandled${isFatal ? " fatal" : ""} error caught by global handler:`,
      error instanceof Error ? (error.stack ?? error.message) : error,
    );
    showErrorMessage(error);
  } catch (handlingError) {
    // avoid throwing from within the error handler itself
    console.error("Error while handling global error", handlingError);
  }
};

const handleUnhandledRejection = (id: number, rejection: unknown) => {
  handleGlobalError(
    rejection instanceof Error
      ? rejection
      : new Error(
          `Unhandled promise rejection (id: ${id}): ${String(rejection)}`,
        ),
    false,
  );
};

/**
 * Catches errors that React's own error boundary (see App.tsx) cannot see:
 * exceptions thrown outside the render phase (event handlers, timers, native
 * callbacks) and unhandled promise rejections. In production, React Native
 * disables its own rejection tracking (see
 * node_modules/react-native/Libraries/Core/polyfillPromise.js), so without
 * this, unhandled rejections would fail silently.
 */
export const initializeGlobalErrorHandler = () => {
  if (appGlobal[initializedFlagKey]) {
    return;
  }
  appGlobal[initializedFlagKey] = true;

  if (globalErrorUtils) {
    const previousHandler = globalErrorUtils.getGlobalHandler();
    globalErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
      handleGlobalError(error, isFatal);
      previousHandler?.(error, isFatal ?? false);
    });
  }

  if (!__DEV__) {
    appGlobal.HermesInternal?.enablePromiseRejectionTracker?.({
      allRejections: true,
      onHandled: () => {},
      onUnhandled: handleUnhandledRejection,
    });
  }
};
