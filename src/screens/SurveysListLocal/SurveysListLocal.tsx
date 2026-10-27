import React, { useCallback, useMemo, useState } from "react";
import { useNavigator } from "navigation/navigator";

import { DateFormats, Dates } from "@openforis/arena-core";
import {
  Button,
  DataVisualizer,
  DataVisualizerCellProps,
  DataVisualizerField,
  Icon,
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
  SurveySelectors,
  useConfirm,
  useAppDispatch,
} from "state";
import { ArrayUtils } from "utils";

import { SurveyStatusCell } from "./SurveyStatusCell";

import styles from "./styles";

const { checkLoggedInUser } = RemoteConnectionUtils;

const minSurveysToShowSearchBar = 5;

const LoadingIconCellRenderer = (_props: DataVisualizerCellProps) => (
  <LoadingIcon />
);

const CurrentSurveyBadge = ({ item }: DataVisualizerCellProps) => {
  const currentSurveyId = SurveySelectors.useCurrentSurveyId();
  if (item.id !== currentSurveyId) return null;
  return (
    <HView style={styles.currentSurveyBadge}>
      <Icon source="check-circle" color="green" />
      <Text textKey="surveys:currentSurvey" variant="labelMedium" />
    </HView>
  );
};

const DatePublishedCellRenderer = ({ item }: DataVisualizerCellProps) => (
  <Text variant="bodySmall">
    {Dates.convertDate({
      dateStr: item.dateModified,
      formatFrom: DateFormats.datetimeStorage,
      formatTo: DateFormats.datetimeDisplay,
    })}
  </Text>
);

const determineSurveyStatus = ({ survey, remoteSurvey }: any) => {
  if (survey.uuid === SurveyService.demoSurveyUuid) return null;

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
  updateStatusLoading,
}: any) => {
  if (screenViewMode === ScreenViewMode.table) {
    return { width: 10 };
  }
  if (!updateStatusLoading) {
    return { minWidth: 10 };
  }
  return { width: 100, height: 30 };
};

type SurveysListLocalState = {
  surveys: any[];
  loading?: boolean;
  updateStatusLoading?: boolean;
  updateStatusChecked?: boolean;
};

const initialState: SurveysListLocalState = {
  surveys: [],
  loading: true,
  updateStatusLoading: false,
  updateStatusChecked: false,
};

export const SurveysListLocal = () => {
  const navigator = useNavigator();
  const dispatch = useAppDispatch();
  const [state, setState] = useState(initialState);
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
        key: survey.id,
        labelOrName: survey.label || survey.name,
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
        await dispatch(SurveyActions.deleteSurveys(surveyIds));
        await loadSurveys();
        return true;
      }
      return false;
    },
    [confirm, dispatch, loadSurveys],
  );

  const onItemPress = useCallback(
    (survey: any) => {
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
          SurveyActions.fetchAndSetCurrentSurvey({ surveyId, navigator }),
        );
      };

      if (updateStatusChecked && status === UpdateStatus.notUpToDate) {
        dispatch(
          SurveyActions.updateSurveyRemote({
            surveyId,
            surveyName,
            surveyRemoteId,
            navigator,
            confirmMessageKey:
              "surveys:updateSurveyWithNewVersionConfirmMessage",
            onConfirm: setLoading,
            onComplete: fetchAndSetSurvey,
            onCancel: fetchAndSetSurvey,
          }),
        );
      } else {
        fetchAndSetSurvey();
      }
    },
    [dispatch, navigator, updateStatusChecked],
  );

  const onCheckUpdatesPress = useCallback(async () => {
    if (!(await checkLoggedInUser({ dispatch, navigator }))) return;

    setState((statePrev) => ({
      ...statePrev,
      updateStatusLoading: true,
      updateStatusChecked: false,
    }));
    const { surveys: remoteSurveySummaries } =
      (await SurveyService.fetchSurveySummariesRemote()) as any;
    const remoteSurveySummariesByUuid = ArrayUtils.indexByUuid(
      remoteSurveySummaries,
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
  }, [dispatch, navigator, surveys]);

  const onImportFromCloudPress = useCallback(async () => {
    if (await checkLoggedInUser({ dispatch, navigator })) {
      navigator.navigateToSurveysListRemote();
    }
  }, [dispatch, navigator]);

  const viewAsCards = screenViewMode === ScreenViewMode.cards;

  const fields = useMemo(() => {
    const _fields: DataVisualizerField[] = viewAsCards
      ? [
          { key: "labelOrName", header: "common:label", cardRole: "title" },
          { key: "name", header: "common:name", cardRole: "subtitle" },
          {
            key: "current",
            header: "surveys:currentSurvey",
            cardRole: "badge",
            cellRenderer: CurrentSurveyBadge,
          },
          {
            key: "dateModified",
            header: "surveys:publishedOn",
            cardRole: "footer",
            cellRenderer: DatePublishedCellRenderer,
          },
        ]
      : [
          {
            key: "name",
            header: "common:name",
          },
          {
            key: "label",
            header: "common:label",
          },
          {
            key: "dateModified",
            header: "surveys:publishedOn",
            tableDetail: true,
            cellRenderer: DatePublishedCellRenderer,
          },
        ];
    if (updateStatusChecked || updateStatusLoading) {
      _fields.push({
        key: "status",
        cardRole: "badge",
        header: "common:status",
        style: determineStatusFieldStyle({
          screenViewMode,
          updateStatusLoading,
        }),
        cellRenderer: updateStatusLoading
          ? LoadingIconCellRenderer
          : SurveyStatusCell,
      });
    }
    return _fields;
  }, [screenViewMode, updateStatusChecked, updateStatusLoading, viewAsCards]);

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
