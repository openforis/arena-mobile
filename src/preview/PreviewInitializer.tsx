import { useCallback, useEffect, useState } from "react";

import { AppLogo } from "appComponents/AppLogo";
import { Text, VView } from "components";
import demoSurvey from "service/demoSurvey.json";
import { DataEntryActions, useAppDispatch } from "state";
import { log, PreviewMode, WebMessageEvent, WebWindow } from "utils";

import {
  PreviewMessageType,
  PreviewOutgoingMessage,
  PreviewProtocol,
  PreviewSurveyMessage,
} from "./previewProtocol";
import styles from "./styles";

const webWindow = WebWindow.get();

const postToParent = (message: PreviewOutgoingMessage) => {
  const parentWindow = webWindow?.parent;
  // not embedded in an iframe
  if (!parentWindow || parentWindow === webWindow) return;
  // no sensitive data sent: any parent origin is allowed unless restricted
  parentWindow.postMessage(message, PreviewMode.parentOrigin ?? "*");
};

const isFromAllowedParent = (event: WebMessageEvent): boolean =>
  !!webWindow &&
  event.source === webWindow.parent &&
  (!PreviewMode.parentOrigin || event.origin === PreviewMode.parentOrigin);

type Props = {
  children?: React.ReactNode;
};

// replaces AppInitializer in web preview mode: waits for the survey sent by the parent window (Arena)
export const PreviewInitializer = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPreview = useCallback(
    async ({ survey, lang, cycle }: Omit<PreviewSurveyMessage, "type">) => {
      try {
        await dispatch(DataEntryActions.startPreview({ survey, lang, cycle }));
        setError(null);
        setReady(true);
      } catch (err: any) {
        log.error("Error starting survey preview", err);
        const message = String(err?.message ?? err);
        setError(message);
        postToParent({ type: PreviewMessageType.error, message });
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (PreviewMode.isDemo) {
      startPreview({ survey: demoSurvey as any });
      return;
    }
    if (!webWindow) return;
    const onMessage = (event: WebMessageEvent) => {
      if (!isFromAllowedParent(event)) return;
      if (!PreviewProtocol.isPreviewSurveyMessage(event.data)) return;
      const { survey, lang, cycle } = event.data;
      startPreview({ survey, lang, cycle });
    };
    webWindow.addEventListener("message", onMessage);
    postToParent({ type: PreviewMessageType.ready });
    return () => webWindow.removeEventListener("message", onMessage);
  }, [startPreview]);

  if (ready) {
    // errors loading a new survey are notified to the parent, the previous one stays visible
    return children;
  }
  return (
    <VView opaque style={styles.container}>
      <AppLogo style={styles.logo} />
      {error ? (
        <Text textKey="app:preview.error" textParams={{ error }} />
      ) : (
        <Text textKey="app:preview.waitingForSurvey" variant="labelLarge" />
      )}
    </VView>
  );
};
