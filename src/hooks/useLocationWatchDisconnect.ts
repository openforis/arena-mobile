import { ExternalGpsService } from "service/externalGps/ExternalGpsService";
import { log } from "utils";

const { internalGpsSourceId } = ExternalGpsService;

export type ExternalGpsDisconnectHandlerDeps = {
  isWatching: boolean;
  shouldFallbackToInternal: boolean;
  stopLocationWatch: () => void;
  startInternalGpsWatch: () => Promise<boolean>;
  activateWatchingState: (params: {
    activeSourceId: string;
    sourceUnavailable: boolean;
  }) => void;
  markSourceUnavailable: () => void;
};

export const handleExternalGpsDisconnect = async ({
  isWatching,
  shouldFallbackToInternal,
  stopLocationWatch,
  startInternalGpsWatch,
  activateWatchingState,
  markSourceUnavailable,
}: ExternalGpsDisconnectHandlerDeps) => {
  if (!isWatching) return;

  log.warn("Location watch: external GPS connection disconnected mid-session");
  stopLocationWatch();

  if (!shouldFallbackToInternal) {
    markSourceUnavailable();
    return;
  }

  const started = await startInternalGpsWatch();
  if (!started) {
    markSourceUnavailable();
    return;
  }

  activateWatchingState({
    activeSourceId: internalGpsSourceId,
    sourceUnavailable: true,
  });
};
