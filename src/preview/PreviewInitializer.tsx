import { useCallback, useEffect, useState } from "react";

import { AppLogo } from "appComponents/AppLogo";
import { Text, VView } from "components";
import demoSurvey from "service/demoSurvey.json";
import { DataEntryActions, SurveyActionTypes, useAppDispatch } from "state";
import { log, PreviewMode, WebMessageEvent, WebWindow } from "utils";

import {
  PreviewMessageType,
  PreviewOutgoingMessage,
  PreviewProtocol,
  PreviewSurveyMessage,
} from "./previewProtocol";
import styles from "./styles";

type PreviewParams = Omit<PreviewSurveyMessage, "type">;

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
  // survey to load: children are unmounted first, their selectors would fail while the record is replaced
  const [pendingPreview, setPendingPreview] = useState<PreviewParams | null>(
    PreviewMode.isDemo ? { survey: demoSurvey as any } : null,
  );

  const startPreview = useCallback(
    async ({ survey, lang, cycle }: PreviewParams) => {
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
    if (!pendingPreview) return;
    startPreview(pendingPreview).finally(() => setPendingPreview(null));
  }, [pendingPreview, startPreview]);

  useEffect(() => {
    if (!webWindow || PreviewMode.isDemo) return;
    const onMessage = (event: WebMessageEvent) => {
      if (!isFromAllowedParent(event)) return;
      const { data } = event;
      if (PreviewProtocol.isPreviewSurveyMessage(data)) {
        const { survey, lang, cycle } = data;
        setReady(false);
        setPendingPreview({ survey, lang, cycle });
      } else if (PreviewProtocol.isPreviewLangMessage(data)) {
        dispatch({
          type: SurveyActionTypes.CURRENT_SURVEY_PREFERRED_LANG_SET,
          lang: data.lang,
        });
      }
    };
    webWindow.addEventListener("message", onMessage);
    postToParent({ type: PreviewMessageType.ready });
    return () => webWindow.removeEventListener("message", onMessage);
  }, [dispatch]);

  if (ready && !pendingPreview) {
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
