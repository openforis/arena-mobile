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
import { ScreenViewMode, SurveyStatus, UpdateStatus } from "model";
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

const testSurveyUuid = "3a3550d2-97ac-4db2-a9b5-ed71ca0a02d3";

const minSurveysToShowSearchBar = 5;

const determineSurveyStatus = ({
  survey,
  remoteSurvey
}: any) => {
  if (survey.uuid === testSurveyUuid) return null;

  if (!remoteSurvey) {
    return SurveyStatus.notInArenaServer;
  }
  if (Dates.isAfter(remoteSurvey.datePublished, survey.dateModified)) {
    return UpdateStatus.notUpToDate;
  }
  return UpdateStatus.upToDate;
};

const determineStatusFieldStyle = ({
  screenViewMode,
  updateStatusLoading
}: any) => {
  if (screenViewMode === ScreenViewMode.table) {
    return { width: 10 };
  }
  if (!updateStatusLoading) {
    return { minWidth: 10 };
  }
  return { width: 100, height: 30 };
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
      surveys: _surveys.map((survey: any) => ({
        ...survey,
        key: survey.id
      })),
      loading: false,
      updateStatusChecked: false,
      updateStatusLoading: false,
    }));
  }, []);

  useNavigationFocus(loadSurveys);

  const { onSearchValueChange, searchValue, surveysFiltered } =
    useSurveysSearch({ surveys });

  const onDeleteSelectedItemIds = useCallback(
    async (surveyIds: any) => {
      if (
        await confirm({
          titleKey: "surveys:confirmDeleteSurvey.title",
          messageKey: "surveys:confirmDeleteSurvey.message",
          swipeToConfirm: true,
        })
      ) {
        // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
        await dispatch(SurveyActions.deleteSurveys(surveyIds));
        await loadSurveys();
      }
    },
    [confirm, dispatch, loadSurveys]
  );

  const onItemPress = useCallback(
    async (survey: any) => {
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
          // @ts-expect-error TS(2345): Argument of type '(dispatch: any) => Promise<void>... Remove this comment to see the full error message
          SurveyActions.fetchAndSetCurrentSurvey({ surveyId, navigation })
        );
      };

      if (updateStatusChecked && status === UpdateStatus.notUpToDate) {
        dispatch(
          // @ts-expect-error TS(2345): Argument of type '(dispatch: any) => Promise<void>... Remove this comment to see the full error message
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
    if (!(await checkLoggedInUser({ dispatch, navigation }))) return;

    setState((statePrev) => ({
      ...statePrev,
      updateStatusLoading: true,
      updateStatusChecked: false,
    }));
    // @ts-expect-error TS(2339): Property 'surveys' does not exist on type '{ error... Remove this comment to see the full error message
    const { surveys: remoteSurveySummaries } =
      await SurveyService.fetchSurveySummariesRemote();
    const remoteSurveySummariesByUuid = ArrayUtils.indexByUuid(
      remoteSurveySummaries
    );
    const surveysUpdated = surveys.map((survey) => {
      // @ts-expect-error TS(2339): Property 'uuid' does not exist on type 'never'.
      const remoteSurvey = remoteSurveySummariesByUuid[survey.uuid];
      const status = determineSurveyStatus({ survey, remoteSurvey });
      // @ts-expect-error TS(2698): Spread types may only be created from object types... Remove this comment to see the full error message
      return { ...survey, status };
    });
    // @ts-expect-error TS(2345): Argument of type '(statePrev: { surveys: never[]; ... Remove this comment to see the full error message
    setState((statePrev) => ({
      ...statePrev,
      surveys: surveysUpdated,
      updateStatusLoading: false,
      updateStatusChecked: true,
    }));
  }, [dispatch, navigation, surveys]);

  const onImportFromCloudPress = useCallback(async () => {
    if (await checkLoggedInUser({ dispatch, navigation })) {
      // @ts-expect-error TS(2769): No overload matches this call.
      navigation.navigate(screenKeys.surveysListRemote);
    }
  }, [dispatch, navigation]);

  const fields = useMemo(() => {
    const _fields = [
      {
        key: "name",
        header: "common:name",
      },
      {
        key: "label",
        header: "common:label",
      },
    ];
    if (updateStatusChecked || updateStatusLoading) {
      _fields.push({
        key: "status",
        header: "common:status",
        // @ts-expect-error TS(2345): Argument of type '{ key: string; header: string; s... Remove this comment to see the full error message
        style: determineStatusFieldStyle({
          screenViewMode,
          updateStatusLoading,
        }),
        cellRenderer: updateStatusLoading ? LoadingIcon : SurveyStatusCell,
      });
    }
    return _fields;
  }, [screenViewMode, updateStatusChecked, updateStatusLoading]);

  if (loading) return <Loader />;

  return (
    <VView style={styles.container}>
      {surveys.length > minSurveysToShowSearchBar && (
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
        // @ts-expect-error TS(2786): 'DataVisualizer' cannot be used as a JSX component... Remove this comment to see the full error message
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
