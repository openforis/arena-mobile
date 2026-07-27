import type { ErrorUtils as ErrorUtilsType } from "react-native";

import { MessageActions } from "state/message";
import { store } from "state/store";

import { Errors } from "./Errors";
import { log } from "./Logger";

const globalErrorUtils = (global as any).ErrorUtils as
  | ErrorUtilsType
  | undefined;

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
  if (globalErrorUtils) {
    const previousHandler = globalErrorUtils.getGlobalHandler();
    globalErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
      handleGlobalError(error, isFatal);
      previousHandler?.(error, isFatal);
    });
  }

  if (!__DEV__) {
    (global as any).HermesInternal?.enablePromiseRejectionTracker?.({
      allRejections: true,
      onHandled: () => {},
      onUnhandled: handleUnhandledRejection,
    });
  }
};
