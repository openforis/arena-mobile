import * as DocumentPicker from "expo-document-picker";
import {
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import { useCallback, useEffect, useMemo, useState } from "react";

import { UUIDs } from "@openforis/arena-core";

import { useToast } from "hooks";
import { useTranslation } from "localization";
import { useNodeComponentLocalState } from "screens/RecordEditor/useNodeComponentLocalState";
import { RecordFileService } from "service/recordFileService";
import { useConfirm } from "state/confirm";
import { SurveySelectors } from "state/survey/selectors";
import { Files, Permissions } from "utils";

const extractFileNameFromAsset = (
  asset: DocumentPicker.DocumentPickerAsset,
): string | null | undefined => {
  return asset.name ?? Files.getNameFromUri(asset.uri);
};

export const useNodeAudioComponent = ({ nodeUuid }: any) => {
  const { t } = useTranslation();
  const toaster = useToast();
  const confirm = useConfirm();
  const surveyId = SurveySelectors.useCurrentSurveyId();

  const { value, updateNodeValue } = useNodeComponentLocalState({
    nodeUuid,
  });

  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });

  const [fileUri, setFileUri] = useState(null as string | null);
  const [audioRecordingInProgress, setAudioRecordingInProgress] =
    useState(false);
  const [audioRecordingPaused, setAudioRecordingPaused] = useState(false);

  const { fileName: valueFileName, fileNameCalculated, fileUuid } = value ?? {};

  const fileName = useMemo(
    () => fileNameCalculated ?? valueFileName,
    [fileNameCalculated, valueFileName],
  );

  useEffect(() => {
    const fileUriUpdated = fileUuid
      ? RecordFileService.getRecordFileUri({ surveyId, fileUuid })
      : null;
    setFileUri(fileUriUpdated);
  }, [fileUuid, surveyId]);

  const onFileSelected = useCallback(
    async (result: DocumentPicker.DocumentPickerResult) => {
      const { assets, canceled } = result;
      if (canceled) return;

      const asset = assets?.[0];
      if (!asset) return;

      const sourceFileUri = asset.uri;
      const fileNameSelected = extractFileNameFromAsset(asset);
      const fileSize = await Files.getSize(sourceFileUri);

      const valueUpdated = {
        fileUuid: UUIDs.v4(),
        fileName: fileNameSelected,
        fileSize,
      };

      await updateNodeValue({ value: valueUpdated, fileUri: sourceFileUri });
    },
    [updateNodeValue],
  );

  const onFileChoosePress = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "audio/*" });
    await onFileSelected(result);
  }, [onFileSelected]);

  const onStartAudioRecordingPress = useCallback(async () => {
    try {
      if (!(await Permissions.requestMicrophonePermissions())) {
        const permissionDeniedMessage = t("permissions:permissionDenied", {
          permission: t(`permissions:types.microphone`),
        });
        toaster(permissionDeniedMessage);
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setAudioRecordingInProgress(true);
      setAudioRecordingPaused(false);
    } catch (error) {
      toaster(
        t("dataEntry:fileAttributeAudio.error.startingRecording", {
          error: String(error),
        }),
      );
    }
  }, [audioRecorder, toaster, t]);

  const onPauseAudioRecordingPress = useCallback(async () => {
    try {
      audioRecorder.pause();
      setAudioRecordingPaused(true);
    } catch (error) {
      toaster(
        t("dataEntry:fileAttributeAudio.error.pausingRecording", {
          error: String(error),
        }),
      );
    }
  }, [audioRecorder, t, toaster]);

  const onResumeAudioRecordingPress = useCallback(async () => {
    try {
      audioRecorder.record();
      setAudioRecordingPaused(false);
    } catch (error) {
      toaster(
        t("dataEntry:fileAttributeAudio.error.resumingRecording", {
          error: String(error),
        }),
      );
    }
  }, [audioRecorder, t, toaster]);

  const onStopAudioRecordingPress = useCallback(async () => {
    try {
      await audioRecorder.stop();
      const recordedFileUri = audioRecorder.uri;

      if (!recordedFileUri) {
        toaster(t("dataEntry:fileAttributeAudio.error.savingRecording"));
        return;
      }

      const recordedFileName = Files.getNameFromUri(recordedFileUri);
      const recordedFileSize = await Files.getSize(recordedFileUri);
      const valueUpdated = {
        fileUuid: UUIDs.v4(),
        fileName: recordedFileName,
        fileSize: recordedFileSize,
      };

      await updateNodeValue({ value: valueUpdated, fileUri: recordedFileUri });
    } catch (error) {
      toaster(
        t("dataEntry:fileAttributeAudio.error.stoppingRecording", {
          error: String(error),
        }),
      );
    } finally {
      setAudioRecordingInProgress(false);
      setAudioRecordingPaused(false);
      await setAudioModeAsync({
        allowsRecording: false,
      });
    }
  }, [audioRecorder, toaster, updateNodeValue, t]);

  const onDeletePress = useCallback(async () => {
    if (
      await confirm({
        messageKey: "dataEntry:fileAttribute.deleteConfirmMessage",
      })
    ) {
      await updateNodeValue({ value: null });
    }
  }, [confirm, updateNodeValue]);

  return {
    audioRecorder,
    audioRecording: audioRecordingInProgress && !audioRecordingPaused,
    audioRecordingInProgress,
    audioRecordingPaused,
    fileName,
    fileUri,
    nodeValue: value,
    onDeletePress,
    onFileChoosePress,
    onPauseAudioRecordingPress,
    onResumeAudioRecordingPress,
    onStartAudioRecordingPress,
    onStopAudioRecordingPress,
  };
};
