import React, { useCallback, useMemo, useState } from "react";
import { useNavigator } from "navigation/navigator";

import { DateFormats, Dates, Surveys } from "@openforis/arena-core";

import {
  DataVisualizer,
  DataVisualizerCellProps,
  DataVisualizerField,
  Loader,
  Searchbar,
  Text,
  ViewMoreText,
  VView,
} from "components";
import { useNavigationFocus } from "hooks";
import { ScreenViewMode } from "model/ScreenViewMode";
import { SurveyService } from "service";
import {
  ConfirmActions,
  ScreenOptionsSelectors,
  SurveyActions,
  SurveySelectors,
  useAppDispatch,
} from "state";

import { useSurveysSearch } from "../SurveysList/useSurveysSearch";

const INITIAL_STATE = {
  surveys: [],
  loading: true,
  errorKey: null,
};

const minSurveysToShowSearchBar = 5;

const DescriptionCellRenderer = ({ item }: DataVisualizerCellProps) => {
  const defaultLanguage = Surveys.getDefaultLanguage(item);
  const description = item.props?.descriptions?.[defaultLanguage];
  return description ? (
    <ViewMoreText numberOfLines={3}>
      <Text>{description}</Text>
    </ViewMoreText>
  ) : null;
};

const DatePublishedCellRenderer = ({ item }: DataVisualizerCellProps) => (
  <Text>
    {Dates.convertDate({
      dateStr: item.datePublished,
      formatFrom: DateFormats.datetimeStorage,
      formatTo: DateFormats.datetimeDisplay,
    })}
  </Text>
);

const StatusCell = ({ item }: DataVisualizerCellProps) => {
  const surveysLocal = SurveySelectors.useSurveysLocal();
  const localSurvey = surveysLocal.find(
    (surveyLocal: any) => surveyLocal.uuid === item.uuid,
  );
  let messageKey: string;
  if (!localSurvey) {
    messageKey = "surveys:loadStatus.notInDevice";
  } else if (Dates.isAfter(item.datePublished, localSurvey.datePublished)) {
    messageKey = "surveys:loadStatus.updated";
  } else {
    messageKey = "surveys:loadStatus.upToDate";
  }
  return <Text textKey={messageKey} />;
};

export const SurveysListRemote = () => {
  const navigator = useNavigator();
  const dispatch = useAppDispatch();
  const surveysLocal = SurveySelectors.useSurveysLocal();
  const screenViewMode = ScreenOptionsSelectors.useCurrentScreenViewMode();
  const viewAsCards = screenViewMode === ScreenViewMode.cards;

  const dataFields = useMemo(() => {
    if (viewAsCards) {
      const cardFields: DataVisualizerField[] = [
        { key: "defaultLabel", header: "common:label", cardRole: "title" },
        { key: "name", header: "common:name", cardRole: "subtitle" },
        {
          key: "loadStatus",
          header: "surveys:loadStatus.label",
          cardRole: "badge",
          cellRenderer: StatusCell,
        },
        {
          key: "description",
          header: "surveys:description",
          cardRole: "body",
          cellRenderer: DescriptionCellRenderer,
        },
        {
          key: "datePublished",
          header: "surveys:publishedOn",
          cardRole: "footer",
          cellRenderer: DatePublishedCellRenderer,
        },
      ];
      return cardFields;
    }
    const fields: any[] = [
      {
        key: "name",
        header: "common:name",
      },
      {
        key: "defaultLabel",
        header: "common:label",
      },
    ];
    // optional: in a narrow table they move to the expanded row
    fields.push(
      {
        key: "description",
        header: "surveys:description",
        optional: true,
        cellRenderer: DescriptionCellRenderer,
      },
      {
        key: "datePublished",
        header: "surveys:publishedOn",
        optional: true,
        cellRenderer: DatePublishedCellRenderer,
      },
      {
        key: "loadStatus",
        header: "surveys:loadStatus.label",
        optional: true,
        cellRenderer: StatusCell,
      },
    );
    return fields;
  }, [viewAsCards]);

  const [state, setState] = useState(INITIAL_STATE);
  const { surveys, loading, errorKey } = state;

  const loadSurveys = async () => {
    setState(INITIAL_STATE);

    const data = await SurveyService.fetchSurveySummariesRemote();
    const { surveys: _surveys = [], errorKey } = data as any;

    if (errorKey) {
      dispatch(
        ConfirmActions.show({
          titleKey: "error",
          confirmButtonTextKey: "loginInfo:login",
          messageKey: "surveys:loadSurveysErrorMessage",
          onConfirm: () => navigator.navigateToSettingsRemoteConnection(),
          onCancel: () => navigator.goBack(),
        }),
      );
    }
    setState((statePrev) => ({
      ...statePrev,
      errorKey,
      loading: false,
      surveys: _surveys.filter(Surveys.isVisibleInMobile),
    }));
  };

  useNavigationFocus(loadSurveys);

  const { onSearchValueChange, searchValue, surveysFiltered } =
    useSurveysSearch({ surveys });

  const onRowPress = useCallback(
    (surveySummary: any) => {
      const surveyName = surveySummary.props.name;
      const localSurveyWithSameUuid = surveysLocal.find(
        (surveyLocal: any) => surveyLocal.uuid === surveySummary.uuid,
      );

      if (localSurveyWithSameUuid) {
        // update existing survey
        dispatch(
          SurveyActions.updateSurveyRemote({
            surveyId: localSurveyWithSameUuid.id,
            surveyRemoteId: surveySummary.id,
            surveyName,
            navigator,
            onConfirm: () =>
              setState((statePrev) => ({ ...statePrev, loading: true })),
          }),
        );
      } else {
        // import new survey
        const onNewSurveyImportConfirm = () => {
          setState((statePrev) => ({ ...statePrev, loading: true }));
          const surveyId = surveySummary.id;
          dispatch(SurveyActions.importSurveyRemote({ surveyId, navigator }));
        };
        dispatch(
          ConfirmActions.show({
            confirmButtonTextKey: "surveys:importSurvey",
            messageKey: "surveys:importSurveyConfirmMessage",
            messageParams: { surveyName },
            onConfirm: onNewSurveyImportConfirm,
          }),
        );
      }
    },
    [dispatch, navigator, surveysLocal],
  );

  if (loading) return <Loader />;

  if (errorKey)
    return (
      <Text
        textKey="surveys:errorFetchingSurveysWithDetails"
        textParams={{ details: errorKey }}
      />
    );

  return (
    <VView fullFlex>
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
          fields={dataFields}
          items={surveysFiltered.map((survey: any) => ({
            key: survey.uuid,
            ...survey,
          }))}
          mode={screenViewMode}
          onItemPress={onRowPress}
          showPagination={surveysFiltered.length > 20}
        />
      )}
    </VView>
  );
};
