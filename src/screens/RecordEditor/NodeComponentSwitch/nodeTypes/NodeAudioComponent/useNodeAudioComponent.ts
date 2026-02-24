import * as DocumentPicker from "expo-document-picker";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useCallback, useEffect, useMemo, useState } from "react";

import { UUIDs } from "@openforis/arena-core";

import { useToast } from "hooks";
import { useNodeComponentLocalState } from "screens/RecordEditor/useNodeComponentLocalState";
import { RecordFileService } from "service/recordFileService";
import { useConfirm } from "state/confirm";
import { SurveySelectors } from "state/survey/selectors";
import { Files } from "utils";

const extractFileNameFromAsset = (
  asset: DocumentPicker.DocumentPickerAsset,
): string | null | undefined => {
  return asset.name ?? Files.getNameFromUri(asset.uri);
};

export const useNodeAudioComponent = ({ nodeUuid }: any) => {
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
  const audioRecorderState = useAudioRecorderState(audioRecorder);

  const [fileUri, setFileUri] = useState(null as string | null);
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
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        toaster("Microphone permission denied");
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setAudioRecordingPaused(false);
    } catch (error) {
      toaster(`Error starting audio recording: ${String(error)}`);
    }
  }, [audioRecorder, toaster]);

  const onPauseAudioRecordingPress = useCallback(async () => {
    try {
      audioRecorder.pause();
      setAudioRecordingPaused(true);
    } catch (error) {
      toaster(`Error pausing audio recording: ${String(error)}`);
    }
  }, [audioRecorder, toaster]);

  const onResumeAudioRecordingPress = useCallback(async () => {
    try {
      audioRecorder.record();
      setAudioRecordingPaused(false);
    } catch (error) {
      toaster(`Error resuming audio recording: ${String(error)}`);
    }
  }, [audioRecorder, toaster]);

  const onStopAudioRecordingPress = useCallback(async () => {
    try {
      await audioRecorder.stop();
      const recordedFileUri = audioRecorder.uri;

      if (!recordedFileUri) {
        toaster("Error saving audio recording");
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
      toaster(`Error stopping audio recording: ${String(error)}`);
    } finally {
      setAudioRecordingPaused(false);
      await setAudioModeAsync({
        allowsRecording: false,
      });
    }
  }, [audioRecorder, toaster, updateNodeValue]);

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
    audioMetering: audioRecorderState.metering ?? null,
    audioRecording: audioRecorderState.isRecording,
    audioRecordingInProgress:
      audioRecorderState.isRecording || audioRecordingPaused,
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
