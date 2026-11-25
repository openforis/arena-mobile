import { useCallback, useMemo, useState } from "react";
import { useNavigator } from "navigation/navigator";

import { Surveys } from "@openforis/arena-core";

import {
  DataVisualizer,
  DataVisualizerCellProps,
  DataVisualizerField,
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
  ScreenOptionsSelectors,
  SurveyActions,
  SurveySelectors,
  useAppDispatch,
} from "state";

import type { SurveySummaryLocal, SurveySummaryRemote } from "model";
import {
  SurveyDatePublishedCell,
  SurveyDescriptionCell,
} from "../SurveysList/SurveyCells";
import { useSurveysSearch } from "../SurveysList/useSurveysSearch";
import { getSurveyLoadStatusKey } from "./surveyLoadStatus";

type SurveysListRemoteState = {
  surveys: SurveySummaryRemote[];
  loading: boolean;
  errorKey: string | null | undefined;
};

const INITIAL_STATE: SurveysListRemoteState = {
  surveys: [],
  loading: true,
  errorKey: null,
};

const minSurveysToShowSearchBar = 5;

type SurveyRemoteItem = SurveySummaryRemote & {
  key: string;
  description: string | null;
  loadStatusKey: string;
};

type SurveyRemoteCellProps = DataVisualizerCellProps<SurveyRemoteItem>;

// loadStatusKey is computed with the items
const StatusCell = ({ item }: SurveyRemoteCellProps) => (
  <Text textKey={item.loadStatusKey} />
);

export const SurveysListRemoteScreen = () => {
  const navigator = useNavigator();
  const dispatch = useAppDispatch();
  const surveysLocal = SurveySelectors.useSurveysLocal();
  const screenViewMode = ScreenOptionsSelectors.useCurrentScreenViewMode();
  const viewAsCards = screenViewMode === ScreenViewMode.cards;

  const dataFields = useMemo(() => {
    if (viewAsCards) {
      const cardFields: DataVisualizerField<SurveyRemoteItem>[] = [
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
          cellRenderer: SurveyDescriptionCell,
        },
        {
          key: "datePublished",
          header: "surveys:publishedOn",
          cardRole: "footer",
          cellRenderer: SurveyDatePublishedCell,
        },
      ];
      return cardFields;
    }
    const fields: DataVisualizerField<SurveyRemoteItem>[] = [
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
        cellRenderer: SurveyDescriptionCell,
      },
      {
        key: "datePublished",
        header: "surveys:publishedOn",
        optional: true,
        cellRenderer: SurveyDatePublishedCell,
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

  const surveysLocalByUuid = useMemo(
    () =>
      new Map<string, SurveySummaryLocal>(
        surveysLocal.map((surveyLocal) => [surveyLocal.uuid, surveyLocal]),
      ),
    [surveysLocal],
  );

  const loadSurveys = useCallback(async () => {
    setState(INITIAL_STATE);

    const data = await SurveyService.fetchSurveySummariesRemote();
    const { surveys: _surveys = [], errorKey } = data as {
      surveys?: SurveySummaryRemote[];
      errorKey?: string;
    };

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
      surveys: _surveys.filter((survey) => Surveys.isVisibleInMobile(survey)),
    }));
  }, [dispatch, navigator]);

  useNavigationFocus(loadSurveys);

  const { onSearchValueChange, searchValue, surveysFiltered } =
    useSurveysSearch({ surveys });

  const onRowPress = useCallback(
    (surveySummary: SurveyRemoteItem) => {
      const surveyName = surveySummary.props.name;
      const localSurveyWithSameUuid = surveysLocalByUuid.get(
        surveySummary.uuid,
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
    [dispatch, navigator, surveysLocalByUuid],
  );

  const items = useMemo(
    () =>
      surveysFiltered.map((survey) => ({
        key: survey.uuid,
        ...survey,
        description: Surveys.getDescription()(survey) ?? null,
        loadStatusKey: getSurveyLoadStatusKey({
          survey,
          localSurvey: surveysLocalByUuid.get(survey.uuid),
        }),
      })),
    [surveysFiltered, surveysLocalByUuid],
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
          items={items}
          mode={screenViewMode}
          onItemPress={onRowPress}
          showPagination={surveysFiltered.length > 20}
        />
      )}
    </VView>
  );
};
