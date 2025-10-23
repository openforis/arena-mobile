import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import { DateFormats, Dates, Surveys } from "@openforis/arena-core";

import {
  DataVisualizer,
  DataVisualizerCellPropTypes,
  Loader,
  Searchbar,
  Text,
  VView,
} from "components";
import { useNavigationFocus } from "hooks";
import { ScreenViewMode } from "model/ScreenViewMode";
import { SurveyService } from "service";
import {
  ConfirmActions,
  DeviceInfoSelectors,
  ScreenOptionsSelectors,
  SurveyActions,
  SurveySelectors,
} from "state";

import { screenKeys } from "../screenKeys";
import { useSurveysSearch } from "../SurveysList/useSurveysSearch";

const INITIAL_STATE = {
  surveys: [],
  loading: true,
  errorKey: null,
};

const minSurveysToShowSearchBar = 5;

const DescriptionCellRenderer = ({
  item
}: any) => {
  const defaultLanguage = Surveys.getDefaultLanguage(item);
  const description = item.props?.descriptions?.[defaultLanguage];
  return description ? <Text>{description}</Text> : null;
};

DescriptionCellRenderer.propTypes = DataVisualizerCellPropTypes;

const DatePublishedCellRenderer = ({
  item
}: any) => (
  <Text>
    {Dates.convertDate({
      dateStr: item.datePublished,
      formatFrom: DateFormats.datetimeStorage,
      formatTo: DateFormats.datetimeDisplay,
    })}
  </Text>
);

DatePublishedCellRenderer.propTypes = DataVisualizerCellPropTypes;

const StatusCell = ({
  item
}: any) => {
  const surveysLocal = SurveySelectors.useSurveysLocal();
  const localSurvey = surveysLocal.find(
    (surveyLocal: any) => surveyLocal.uuid === item.uuid
  );
  let messageKey = null;
  if (!localSurvey) {
    messageKey = "surveys:loadStatus.notInDevice";
  } else if (Dates.isAfter(item.datePublished, localSurvey.datePublished)) {
    messageKey = "surveys:loadStatus.updated";
  } else {
    messageKey = "surveys:loadStatus.upToDate";
  }
  return <Text textKey={messageKey} />;
};

StatusCell.propTypes = DataVisualizerCellPropTypes;

export const SurveysListRemote = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const surveysLocal = SurveySelectors.useSurveysLocal();
  const screenViewMode = ScreenOptionsSelectors.useCurrentScreenViewMode();
  const viewAsList = screenViewMode === ScreenViewMode.list;
  const isLandscape = DeviceInfoSelectors.useOrientationIsLandscape();

  const dataFields = useMemo(() => {
    const fields = [
      {
        key: "name",
        header: "common:name",
      },
      {
        key: "defaultLabel",
        header: "common:label",
      },
    ];
    if (isLandscape || viewAsList) {
      fields.push(
        {
          key: "description",
          header: "surveys:description",
          // @ts-expect-error TS(2345): Argument of type '{ key: string; header: string; c... Remove this comment to see the full error message
          cellRenderer: DescriptionCellRenderer,
        },
        {
          key: "datePublished",
          header: "surveys:publishedOn",
          cellRenderer: DatePublishedCellRenderer,
        },
        {
          key: "loadStatus",
          header: "surveys:loadStatus.label",
          cellRenderer: StatusCell,
        }
      );
    }
    return fields;
  }, [isLandscape, viewAsList]);

  const [state, setState] = useState(INITIAL_STATE);
  const { surveys, loading, errorKey } = state;

  const loadSurveys = async () => {
    setState(INITIAL_STATE);

    const data = await SurveyService.fetchSurveySummariesRemote();
    // @ts-expect-error TS(2339): Property 'surveys' does not exist on type '{ error... Remove this comment to see the full error message
    const { surveys: _surveys = [], errorKey } = data;

    if (errorKey) {
      dispatch(
        ConfirmActions.show({
          titleKey: "error",
          confirmButtonTextKey: "loginInfo:login",
          messageKey: "surveys:loadSurveysErrorMessage",
          onConfirm: () =>
            // @ts-expect-error TS(2769): No overload matches this call.
            navigation.navigate(screenKeys.settingsRemoteConnection),
          onCancel: () => navigation.goBack(),
        })
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
        (surveyLocal: any) => surveyLocal.uuid === surveySummary.uuid
      );

      if (localSurveyWithSameUuid) {
        // update existing survey
        dispatch(
          // @ts-expect-error TS(2345): Argument of type '(dispatch: any) => Promise<void>... Remove this comment to see the full error message
          SurveyActions.updateSurveyRemote({
            surveyId: localSurveyWithSameUuid.id,
            surveyRemoteId: surveySummary.id,
            surveyName,
            navigation,
            onConfirm: () =>
              setState((statePrev) => ({ ...statePrev, loading: true })),
          })
        );
      } else {
        // import new survey
        dispatch(
          ConfirmActions.show({
            confirmButtonTextKey: "surveys:importSurvey",
            messageKey: "surveys:importSurveyConfirmMessage",
            messageParams: { surveyName },
            onConfirm: () => {
              setState((statePrev) => ({ ...statePrev, loading: true }));
              const surveyId = surveySummary.id;
              dispatch(
                // @ts-expect-error TS(2345): Argument of type '(dispatch: any) => Promise<void>... Remove this comment to see the full error message
                SurveyActions.importSurveyRemote({ surveyId, navigation })
              );
            },
          })
        );
      }
    },
    [dispatch, navigation, surveysLocal]
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
        // @ts-expect-error TS(2786): 'DataVisualizer' cannot be used as a JSX component... Remove this comment to see the full error message
        <DataVisualizer
          fields={dataFields}
          items={surveysFiltered.map((survey: any) => ({
            key: survey.uuid,
            ...survey
          }))}
          mode={screenViewMode}
          onItemPress={onRowPress}
          showPagination={surveysFiltered.length > 20}
        />
      )}
    </VView>
  );
};
