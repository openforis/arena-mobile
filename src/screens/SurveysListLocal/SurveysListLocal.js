import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import { Dates } from "@openforis/arena-core";
import {
  Button,
  DataVisualizer,
  HView,
  Loader,
  LoadingIcon,
  Searchbar,
  Text,
  VView,
} from "components";
import { UpdateStatus } from "model";
import { SurveyService } from "service";
import { useIsNetworkConnected, useNavigationFocus } from "hooks";
import { useSurveysSearch } from "screens/SurveysList/useSurveysSearch";
import {
  RemoteConnectionUtils,
  SurveyActions,
  ScreenOptionsSelectors,
  useConfirm,
} from "state";
import { ArrayUtils } from "utils";

import { screenKeys } from "../screenKeys";
import { SurveyStatusCell } from "./SurveyStatusCell";

import styles from "./styles";

const { checkLoggedInUser } = RemoteConnectionUtils;

const dataFields = [
  {
    key: "name",
    header: "common:name",
  },
  {
    key: "label",
    header: "common:label",
  },
];

const dataFieldsWithUpdateStatus = [
  ...dataFields,
  {
    key: "status",
    header: "common:status",
    style: { width: 10 },
    cellRenderer: SurveyStatusCell,
  },
];

const dataFieldsWithUpdateStatusLoading = [
  ...dataFields,
  {
    key: "status",
    header: "common:status",
    style: { width: 10 },
    cellRenderer: LoadingIcon,
  },
];

const testSurveyUuid = "3a3550d2-97ac-4db2-a9b5-ed71ca0a02d3";

const determineSurveyStatus = ({ survey, remoteSurvey }) => {
  if (survey.uuid === testSurveyUuid) return null;

  if (!remoteSurvey) {
    return UpdateStatus.error;
  }
  if (Dates.isAfter(remoteSurvey.datePublished, survey.dateModified)) {
    return UpdateStatus.notUpToDate;
  }
  return UpdateStatus.upToDate;
};

export const SurveysListLocal = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [state, setState] = useState({
    surveys: [],
    loading: true,
    updateStatusLoading: false,
    updateStatusChecked: false,
  });
  const networkAvailable = useIsNetworkConnected();
  const screenViewMode = ScreenOptionsSelectors.useCurrentScreenViewMode();
  const confirm = useConfirm();
  const { loading, surveys, updateStatusChecked, updateStatusLoading } = state;

  const loadSurveys = useCallback(async () => {
    const _surveys = await SurveyService.fetchSurveySummariesLocal();

    setState((statePrev) => ({
      ...statePrev,
      surveys: _surveys.map((survey) => ({ ...survey, key: survey.id })),
      loading: false,
      updateStatusChecked: false,
      updateStatusLoading: false,
    }));
  }, []);

  useNavigationFocus(loadSurveys);

  const { onSearchValueChange, searchValue, surveysFiltered } =
    useSurveysSearch({ surveys });

  const onDeleteSelectedItemIds = useCallback(
    async (surveyIds) => {
      if (
        await confirm({
          titleKey: "surveys:confirmDeleteSurvey.title",
          messageKey: "surveys:confirmDeleteSurvey.message",
          swipeToConfirm: true,
        })
      ) {
        await dispatch(SurveyActions.deleteSurveys(surveyIds));
        await loadSurveys();
      }
    },
    [confirm, dispatch, loadSurveys]
  );

  const onItemPress = useCallback(
    async (survey) => {
      const {
        id: surveyId,
        name: surveyName,
        remoteId: surveyRemoteId,
        status,
      } = survey;

      const setLoading = (loading = true) =>
        setState((statePrev) => ({ ...statePrev, loading }));

      const fetchAndSetSurvey = () => {
        setLoading();
        dispatch(
          SurveyActions.fetchAndSetCurrentSurvey({ surveyId, navigation })
        );
      };

      if (updateStatusChecked && status === UpdateStatus.notUpToDate) {
        dispatch(
          SurveyActions.updateSurveyRemote({
            surveyId,
            surveyName,
            surveyRemoteId,
            navigation,
            confirmMessageKey:
              "surveys:updateSurveyWithNewVersionConfirmMessage",
            onConfirm: setLoading,
            onComplete: fetchAndSetSurvey,
            onCancel: fetchAndSetSurvey,
          })
        );
      } else {
        fetchAndSetSurvey();
      }
    },
    [dispatch, navigation, updateStatusChecked]
  );

  const onCheckUpdatesPress = useCallback(async () => {
    setState((statePrev) => ({
      ...statePrev,
      updateStatusLoading: true,
      updateStatusChecked: false,
    }));
    const { surveys: remoteSurveySummaries } =
      await SurveyService.fetchSurveySummariesRemote();
    const remoteSurveySummariesByUuid = ArrayUtils.indexByUuid(
      remoteSurveySummaries
    );
    const surveysUpdated = surveys.map((survey) => {
      const remoteSurvey = remoteSurveySummariesByUuid[survey.uuid];
      const status = determineSurveyStatus({ survey, remoteSurvey });
      return { ...survey, status };
    });
    setState((statePrev) => ({
      ...statePrev,
      surveys: surveysUpdated,
      updateStatusLoading: false,
      updateStatusChecked: true,
    }));
  }, [surveys]);

  const onImportFromCloudPress = useCallback(async () => {
    if (await checkLoggedInUser({ dispatch, navigation })) {
      navigation.navigate(screenKeys.surveysListRemote);
    }
  }, [dispatch, navigation]);

  const fields = useMemo(() => {
    if (updateStatusChecked) return dataFieldsWithUpdateStatus;
    if (updateStatusLoading) return dataFieldsWithUpdateStatusLoading;
    return dataFields;
  }, [updateStatusChecked, updateStatusLoading]);

  if (loading) return <Loader />;

  return (
    <VView style={styles.container}>
      {surveys.length > 1 && (
        <Searchbar value={searchValue} onChange={onSearchValueChange} />
      )}
      {surveysFiltered.length === 0 && (
        <Text
          textKey={
            surveys.length > 0
              ? "surveys:noSurveysMatchingYourSearch"
              : "surveys:noAvailableSurveysFound"
          }
          variant="labelLarge"
        />
      )}
      {surveysFiltered.length > 0 && (
        <DataVisualizer
          fields={fields}
          mode={screenViewMode}
          onDeleteSelectedItemIds={onDeleteSelectedItemIds}
          onItemPress={onItemPress}
          items={surveysFiltered}
          selectable
        />
      )}
      <HView style={styles.buttonsBar}>
        {surveysFiltered.length > 0 && (
          <Button
            disabled={!networkAvailable}
            icon="update"
            loading={updateStatusLoading}
            onPress={onCheckUpdatesPress}
            style={styles.importButton}
            textKey="surveys:checkUpdates"
          />
        )}
        <Button
          disabled={!networkAvailable}
          icon="cloud-download-outline"
          onPress={onImportFromCloudPress}
          style={styles.importButton}
          textKey="surveys:importFromCloud"
        />
      </HView>
    </VView>
  );
};
