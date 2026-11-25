import React, { useCallback, useMemo, useState } from "react";
import { useNavigator } from "navigation/navigator";

import { Dates } from "@openforis/arena-core";
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
import { SurveyService } from "service";
import { useIsNetworkConnected, useNavigationFocus } from "hooks";
import {
  ScreenViewMode,
  SurveyStatus,
  SurveySummaryLocal,
  SurveySummaryRemote,
  UpdateStatus,
} from "model";
import {
  SurveyDatePublishedCell,
  SurveyDescriptionCell,
} from "screens/SurveysList/SurveyCells";
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

import { SurveyStatusCell, SurveyStatusItem } from "./SurveyStatusCell";

import styles from "./styles";

const { checkLoggedInUser } = RemoteConnectionUtils;

const minSurveysToShowSearchBar = 5;

type SurveyLocalItem = SurveyStatusItem &
  SurveySummaryLocal & {
    labelOrName: string;
    // the local date_modified column stores the date published
    datePublished: string;
  };

const LoadingIconCellRenderer = (_props: DataVisualizerCellProps) => (
  <LoadingIcon />
);

const CurrentSurveyBadge = ({
  item,
}: DataVisualizerCellProps<SurveyLocalItem>) => {
  const currentSurveyId = SurveySelectors.useCurrentSurveyId();
  if (item.id !== currentSurveyId) return null;
  return (
    <HView style={styles.currentSurveyBadge}>
      <Icon source="check-circle" color="green" />
      <Text textKey="surveys:currentSurvey" variant="labelMedium" />
    </HView>
  );
};

const determineSurveyStatus = ({
  survey,
  remoteSurvey,
}: {
  survey: SurveySummaryLocal;
  remoteSurvey: SurveySummaryRemote | undefined;
}) => {
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
}: {
  screenViewMode: ScreenViewMode;
  updateStatusLoading?: boolean;
}) => {
  if (screenViewMode === ScreenViewMode.table) {
    return { width: 10 };
  }
  if (!updateStatusLoading) {
    return { minWidth: 10 };
  }
  return { width: 100, height: 30 };
};

type SurveysListLocalState = {
  surveys: SurveyLocalItem[];
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

export const SurveysListLocalScreen = () => {
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
      surveys: _surveys.map((survey) => ({
        ...survey,
        key: String(survey.id),
        labelOrName: survey.label || survey.name,
        datePublished: survey.dateModified,
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
    async (surveyKeys: string[]) => {
      if (
        await confirm({
          titleKey: "surveys:confirmDeleteSurvey.title",
          messageKey: "surveys:confirmDeleteSurvey.message",
          swipeToConfirm: true,
        })
      ) {
        const surveyIds = surveys
          .filter((survey) => surveyKeys.includes(survey.key))
          .map((survey) => survey.id);
        await dispatch(SurveyActions.deleteSurveys(surveyIds));
        await loadSurveys();
        return true;
      }
      return false;
    },
    [confirm, dispatch, loadSurveys, surveys],
  );

  const onItemPress = useCallback(
    (survey: SurveyLocalItem) => {
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
      (await SurveyService.fetchSurveySummariesRemote()) as {
        surveys: SurveySummaryRemote[];
      };
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
    const _fields: DataVisualizerField<SurveyLocalItem>[] = viewAsCards
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
            key: "description",
            header: "surveys:description",
            cardRole: "body",
            cellRenderer: SurveyDescriptionCell,
          },
          {
            key: "datePublished",
            header: "surveys:publishedOn",
            cardRole: "footer",
            cellRenderer: SurveyDatePublishedCell,
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
          // optional: in a narrow table they move to the expanded row
          {
            key: "description",
            header: "surveys:description",
            optional: true,
            cellRenderer: SurveyDescriptionCell,
          },
          {
            key: "datePublished",
            header: "surveys:publishedOn",
            optional: true,
            cellRenderer: SurveyDatePublishedCell,
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
