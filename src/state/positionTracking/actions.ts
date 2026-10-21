import { Objects, Records } from "@openforis/arena-core";

import { GpsSourceSetting, PositionTracks } from "model";
import {
  LocationSourceError,
  PositionTrackingService,
  PositionTrackingSettings,
  PositionTrackStatus,
} from "service/positionTracking";
import { log, SystemUtils } from "utils";

import { ConfirmUtils } from "../confirm/utils";
import { DataEntryActions } from "../dataEntry/actions";
import { DataEntrySelectors } from "../dataEntry/selectors";
import { SettingsSelectors } from "../settings/selectors";
import { SurveySelectors } from "../survey/selectors";
import { ToastActions } from "../toast";

import { POSITION_TRACKING_RESET, POSITION_TRACKING_UPDATE } from "./reducer";
import { PositionTrackingSelectors } from "./selectors";
import { PositionTrackingStatus } from "./types";

// the attribute value is updated periodically, not on every location
const FLUSH_INTERVAL_MS = 60000;
const genericErrorKey = "dataEntry:positionTracking.error.generic";

let flushInterval: ReturnType<typeof setInterval> | null = null;
let unsubscribeFromService: (() => void) | null = null;
let flushInProgress: Promise<boolean> | null = null;

const update = (payload: any) => ({ type: POSITION_TRACKING_UPDATE, payload });

const getTrackingSettings = (state: any): PositionTrackingSettings => {
  const settings = SettingsSelectors.selectSettings(state);
  return {
    accuracyThreshold: settings.positionTrackingAccuracyThreshold ?? 20,
    batterySaver: settings.positionTrackingBatterySaver ?? true,
    minDistance: settings.positionTrackingMinDistance ?? 10,
    preferredGpsSourceId:
      settings.preferredGpsSourceId ?? GpsSourceSetting.auto,
  };
};

const statsUpdate = () => update(PositionTrackingService.getStats());

const listenToServiceUpdates = (dispatch: any) => {
  unsubscribeFromService ??= PositionTrackingService.subscribe(() =>
    dispatch(statsUpdate()),
  );
};

const stopListeningToServiceUpdates = () => {
  unsubscribeFromService?.();
  unsubscribeFromService = null;
};

const setKeepScreenAwake = async (getState: any, tracking: boolean) => {
  const { keepScreenAwake } = SettingsSelectors.selectSettings(getState());
  try {
    await SystemUtils.setKeepScreenAwake(tracking || keepScreenAwake);
  } catch (error) {
    log.warn("PositionTracking: cannot change keep screen awake", error);
  }
};

const stopFlushTimer = () => {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
};

const toErrorKey = (error: unknown) =>
  error instanceof LocationSourceError ? error.key : genericErrorKey;

const _discard = async (dispatch: any) => {
  stopFlushTimer();
  stopListeningToServiceUpdates();
  await PositionTrackingService.discard();
  dispatch({ type: POSITION_TRACKING_RESET });
};

const _flush = async (dispatch: any, getState: any): Promise<boolean> => {
  const track = PositionTrackingService.getTrack();
  if (!track) return true;

  const record = DataEntrySelectors.selectRecordUnsafe(getState());
  if (record?.uuid !== track.recordUuid) return false;

  const node = Records.getNodeByUuid(track.nodeUuid)(record);
  if (!node) {
    // tracked node (or one of its ancestors) deleted
    log.info("PositionTracking: tracked node not found, discarding track");
    await _discard(dispatch);
    return true;
  }
  const value = PositionTrackingService.buildValue();
  if (!value) return true;

  await dispatch(DataEntryActions.updateAttribute({ uuid: node.uuid, value }));

  const nodeUpdated = Records.getNodeByUuid(track.nodeUuid)(
    DataEntrySelectors.selectRecord(getState()),
  );
  return Objects.isEqual(nodeUpdated?.value?.geometry, value.geometry);
};

// writes the recorded track into the attribute value
const flushTrack = () => async (dispatch: any, getState: any) => {
  if (flushInProgress) {
    await flushInProgress;
  }
  flushInProgress = _flush(dispatch, getState);
  try {
    return await flushInProgress;
  } catch (error) {
    log.error("PositionTracking: error updating the attribute value", error);
    return false;
  } finally {
    flushInProgress = null;
  }
};

const startFlushTimer = (dispatch: any) => {
  stopFlushTimer();
  flushInterval = setInterval(() => {
    void dispatch(flushTrack());
  }, FLUSH_INTERVAL_MS);
};

const _startNew =
  ({ nodeUuid }: { nodeUuid: string }) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    const survey = SurveySelectors.selectCurrentSurvey(state)!;
    const record = DataEntrySelectors.selectRecord(state);
    const node = Records.getNodeByUuid(nodeUuid)(record);
    if (!node) return;

    dispatch({ type: POSITION_TRACKING_RESET });
    dispatch(
      update({
        status: PositionTrackingStatus.starting,
        recordUuid: record.uuid,
        nodeUuid,
      }),
    );
    try {
      await PositionTrackingService.start({
        surveyId: survey.id!,
        recordUuid: record.uuid,
        nodeUuid,
        baseValue: PositionTracks.isTrackValue(node.value) ? node.value : null,
        settings: getTrackingSettings(state),
      });
    } catch (error) {
      log.warn("PositionTracking: cannot start tracking", error);
      dispatch(
        update({
          status: PositionTrackingStatus.idle,
          errorKey: toErrorKey(error),
        }),
      );
      return;
    }
    listenToServiceUpdates(dispatch);
    dispatch(statsUpdate());
    dispatch(update({ status: PositionTrackingStatus.tracking }));
    startFlushTimer(dispatch);
    await setKeepScreenAwake(getState, true);
  };

const pauseTracking = () => async (dispatch: any, getState: any) => {
  const { status } =
    PositionTrackingSelectors.selectPositionTrackingState(getState());
  if (status !== PositionTrackingStatus.tracking) return;
  stopFlushTimer();
  await PositionTrackingService.pause();
  dispatch(statsUpdate());
  dispatch(update({ status: PositionTrackingStatus.paused }));
  await setKeepScreenAwake(getState, false);
  await dispatch(flushTrack());
};

const resumeTracking = () => async (dispatch: any, getState: any) => {
  const { status } =
    PositionTrackingSelectors.selectPositionTrackingState(getState());
  if (status !== PositionTrackingStatus.paused) return;
  dispatch(update({ errorKey: null }));
  try {
    await PositionTrackingService.resume(getTrackingSettings(getState()));
  } catch (error) {
    log.warn("PositionTracking: cannot resume tracking", error);
    dispatch(update({ errorKey: toErrorKey(error) }));
    return;
  }
  listenToServiceUpdates(dispatch);
  dispatch(update({ status: PositionTrackingStatus.tracking }));
  startFlushTimer(dispatch);
  await setKeepScreenAwake(getState, true);
};

// stops tracking, writing the track into the attribute; the stored track is removed only if
// the attribute has been updated, otherwise it's kept to be recovered later
const _stop = async (dispatch: any, getState: any): Promise<boolean> => {
  stopFlushTimer();
  if (PositionTrackingService.isWatching()) {
    await PositionTrackingService.pause();
  }
  const flushed = await dispatch(flushTrack());
  if (!flushed) {
    log.warn("PositionTracking: attribute not updated, track kept");
    return false;
  }
  await _discard(dispatch);
  await setKeepScreenAwake(getState, false);
  return true;
};

const stopTracking =
  ({ confirm = true }: { confirm?: boolean } = {}) =>
  async (dispatch: any, getState: any) => {
    if (!PositionTrackingService.getTrack()) {
      dispatch({ type: POSITION_TRACKING_RESET });
      return true;
    }
    if (
      confirm &&
      !(await ConfirmUtils.confirm({
        dispatch,
        messageKey: "dataEntry:positionTracking.stopConfirm",
        confirmButtonTextKey: "dataEntry:positionTracking.stop",
      }))
    ) {
      return false;
    }
    const stopped = await _stop(dispatch, getState);
    if (!stopped) {
      dispatch(statsUpdate());
      dispatch(update({ status: PositionTrackingStatus.paused }));
      dispatch(ToastActions.show("dataEntry:positionTracking.error.notSaved"));
    }
    return stopped;
  };

const startTracking =
  ({ nodeUuid }: { nodeUuid: string }) =>
  async (dispatch: any, getState: any) => {
    const state = getState();
    if (!DataEntrySelectors.selectCanEditRecord(state)) return;

    const { status, nodeUuid: currentNodeUuid } =
      PositionTrackingSelectors.selectPositionTrackingState(state);

    if (PositionTrackingService.getTrack()) {
      if (currentNodeUuid === nodeUuid) {
        await dispatch(resumeTracking());
        return;
      }
      // only one track at a time
      if (
        !(await ConfirmUtils.confirm({
          dispatch,
          messageKey: "dataEntry:positionTracking.stopCurrentConfirm",
        }))
      ) {
        return;
      }
      if (!(await dispatch(stopTracking({ confirm: false })))) return;
    } else if (status === PositionTrackingStatus.starting) {
      return;
    }
    await dispatch(_startNew({ nodeUuid }));
  };

// deletes the track recorded in the attribute (after a strong confirmation) and starts a new one
const restartTracking =
  ({ nodeUuid }: { nodeUuid: string }) =>
  async (dispatch: any, getState: any) => {
    if (!DataEntrySelectors.selectCanEditRecord(getState())) return;
    if (
      !(await ConfirmUtils.confirm({
        dispatch,
        titleKey: "dataEntry:positionTracking.restartConfirm.title",
        messageKey: "dataEntry:positionTracking.restartConfirm.message",
        confirmButtonTextKey: "dataEntry:positionTracking.restart",
        swipeToConfirm: true,
      }))
    ) {
      return;
    }
    if (
      PositionTrackingService.getTrack() &&
      !(await dispatch(stopTracking({ confirm: false })))
    ) {
      return;
    }
    await dispatch(
      DataEntryActions.updateAttribute({ uuid: nodeUuid, value: null }),
    );
    const node = Records.getNodeByUuid(nodeUuid)(
      DataEntrySelectors.selectRecord(getState()),
    );
    // value not cleared (e.g. record being synced): the track is kept
    if (!node || node.value) return;
    await dispatch(_startNew({ nodeUuid }));
  };

// deletes the whole track (after a strong confirmation), e.g. when it was recorded by mistake
const deleteTrack =
  ({ nodeUuid }: { nodeUuid: string }) =>
  async (dispatch: any, getState: any) => {
    if (!DataEntrySelectors.selectCanEditRecord(getState())) return;
    if (
      !(await ConfirmUtils.confirm({
        dispatch,
        titleKey: "dataEntry:positionTracking.deleteConfirm.title",
        messageKey: "dataEntry:positionTracking.deleteConfirm.message",
        confirmButtonTextKey: "common:delete",
        swipeToConfirm: true,
      }))
    ) {
      return;
    }
    const track = PositionTrackingService.getTrack();
    const trackingNode = track?.nodeUuid === nodeUuid;
    if (track && trackingNode) {
      stopFlushTimer();
      await flushInProgress;
      if (PositionTrackingService.isWatching()) {
        await PositionTrackingService.pause();
      }
    }
    await dispatch(
      DataEntryActions.updateAttribute({ uuid: nodeUuid, value: null }),
    );
    const node = Records.getNodeByUuid(nodeUuid)(
      DataEntrySelectors.selectRecord(getState()),
    );
    if (node?.value) {
      // value not cleared (e.g. record being synced): the track is kept
      if (trackingNode) {
        dispatch(statsUpdate());
        dispatch(update({ status: PositionTrackingStatus.paused }));
      }
      return;
    }
    if (trackingNode) {
      await _discard(dispatch);
      await setKeepScreenAwake(getState, false);
    }
  };

// starts tracking in a new record, when it has a trackable attribute in the root entity
const autoStartTracking = () => async (dispatch: any, getState: any) => {
  const state = getState();
  const survey = SurveySelectors.selectCurrentSurvey(state);
  const record = DataEntrySelectors.selectRecordUnsafe(state);
  if (!survey || !record) return;
  const node = PositionTracks.findAutoStartNode({ survey, record });
  if (node) {
    log.info(`PositionTracking: auto-start in new record ${record.uuid}`);
    await dispatch(startTracking({ nodeUuid: node.uuid }));
  }
};

// called before closing the record editor
const closeTrack = () => async (dispatch: any, getState: any) => {
  if (!PositionTrackingService.getTrack()) {
    dispatch({ type: POSITION_TRACKING_RESET });
    return;
  }
  if (!(await _stop(dispatch, getState))) {
    // kept in the DB, it will be recovered when the record is opened again
    stopFlushTimer();
    stopListeningToServiceUpdates();
    await PositionTrackingService.unload();
    dispatch({ type: POSITION_TRACKING_RESET });
    await setKeepScreenAwake(getState, false);
  }
};

// recovers a track not written into the record (e.g. the app was closed while tracking)
const recoverTrackForOpenRecord =
  () => async (dispatch: any, getState: any) => {
    const record = DataEntrySelectors.selectRecordUnsafe(getState());
    if (!record) return;
    const currentTrack = PositionTrackingService.getTrack();
    if (currentTrack) {
      if (currentTrack.recordUuid === record.uuid) return;
      await dispatch(closeTrack());
    }
    try {
      const track = await PositionTrackingService.fetchTrackByRecordUuid(
        record.uuid,
      );
      if (!track) return;
      if (!Records.getNodeByUuid(track.nodeUuid)(record)) {
        await PositionTrackingService.deleteTracksByRecordUuids([record.uuid]);
        return;
      }
      await PositionTrackingService.load(track);
      listenToServiceUpdates(dispatch);
      dispatch(statsUpdate());
      dispatch(
        update({
          status: PositionTrackingStatus.paused,
          recordUuid: record.uuid,
          nodeUuid: track.nodeUuid,
        }),
      );
      await dispatch(flushTrack());
      if (track.status === PositionTrackStatus.tracking) {
        dispatch(ToastActions.show("dataEntry:positionTracking.interrupted"));
      }
    } catch (error) {
      log.error("PositionTracking: error recovering track", error);
    }
  };

const deleteTracksOfRecords =
  (recordUuids: string[]) => async (dispatch: any) => {
    const track = PositionTrackingService.getTrack();
    if (track && recordUuids.includes(track.recordUuid)) {
      await _discard(dispatch);
    }
    await PositionTrackingService.deleteTracksByRecordUuids(recordUuids);
  };

export const PositionTrackingActions = {
  startTracking,
  restartTracking,
  deleteTrack,
  autoStartTracking,
  pauseTracking,
  resumeTracking,
  stopTracking,
  flushTrack,
  closeTrack,
  recoverTrackForOpenRecord,
  deleteTracksOfRecords,
};
