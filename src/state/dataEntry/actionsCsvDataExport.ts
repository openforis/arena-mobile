import {
  FlatDataExportDefaultOptions,
  FlatDataExportOption,
  FlatDataExportOptions,
  JobSerialized,
  Surveys,
} from "@openforis/arena-core";

import { i18n } from "localization";
import {
  FlatDataExportJob,
  FlatDataExportJobResult,
} from "service/dataExportJob";
import { RemoteConnectionSelectors } from "state/remoteConnection";
import type { AppDispatch, RootState } from "state/store";
import { Files, log } from "utils";

import { ConfirmActions, OnConfirmParams } from "../confirm";
import { JobMonitorActions } from "../jobMonitor";
import { SurveySelectors } from "../survey";
import { handleDataExportError } from "./dataExportUtils";

const { t } = i18n;

const determineAvailableDataExportOptions = ({
  state,
}: {
  state: RootState;
}): FlatDataExportOption[] => {
  const survey = SurveySelectors.selectCurrentSurvey(state)!;
  const result = [
    FlatDataExportOption.includeAncestorAttributes,
    FlatDataExportOption.includeCategoryItemsLabels,
    FlatDataExportOption.includeFiles,
    FlatDataExportOption.includeTaxonScientificName,
  ];
  if (Surveys.getCycleKeys(survey).length > 1) {
    result.push(FlatDataExportOption.addCycle);
  }
  return result;
};

const selectedOptionsToDataExportOptions = ({
  availableOptions,
  selectedOptions,
}: {
  availableOptions: FlatDataExportOption[];
  selectedOptions: string[] | undefined;
}) => {
  const options: FlatDataExportOptions = {};
  for (const option of availableOptions) {
    options[option] = selectedOptions?.includes(option) ?? false;
  }
  if (selectedOptions?.includes(FlatDataExportOption.includeFiles)) {
    options[FlatDataExportOption.includeFileAttributeDefs] = true;
  }
  return options;
};

export const startCsvDataExportJob =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const state = getState();

      const availableDataExportOptions = determineAvailableDataExportOptions({
        state,
      });
      const multipleChoiceOptions = availableDataExportOptions.map(
        (option) => ({
          value: option,
          label: `dataEntry:dataExport.option.${option}`,
        }),
      );

      const onConfirm = async ({
        selectedMultipleChoiceValues,
      }: OnConfirmParams) => {
        log.debug(
          `starting CSV data export with options:`,
          selectedMultipleChoiceValues,
        );

        await dispatch(ConfirmActions.dismiss());

        const user = RemoteConnectionSelectors.selectLoggedUserSafe(state);
        const survey = SurveySelectors.selectCurrentSurvey(state)!;
        const cycle = SurveySelectors.selectCurrentSurveyCycle(state)!;

        const selectedDataExportOptions = {
          ...FlatDataExportDefaultOptions,
          ...selectedOptionsToDataExportOptions({
            availableOptions: availableDataExportOptions,
            selectedOptions: selectedMultipleChoiceValues,
          }),
        };

        log.debug("Initializing FlatDataExportJob");

        const dataExportJob = new FlatDataExportJob({
          type: "FlatDataExportJob",
          user,
          survey,
          surveyId: survey.id!,
          cycle,
          options: selectedDataExportOptions,
        });

        await JobMonitorActions.startAsync({
          autoDismiss: true,
          dispatch,
          job: dataExportJob,
          titleKey: "dataEntry:dataExport.exportingData",
          onJobComplete: (
            jobComplete: JobSerialized<FlatDataExportJobResult>,
          ) => {
            const { result } = jobComplete;
            const { outputFileUri } = result || {};
            if (outputFileUri) {
              void Files.shareFile({
                url: outputFileUri,
                mimeType: Files.MIME_TYPES.zip,
                dialogTitle: t("dataEntry:dataExport.shareExportedFile"),
              });
            }
          },
        });
      };
      dispatch(
        ConfirmActions.show({
          titleKey: "dataEntry:dataExport.confirm.title",
          messageKey: "dataEntry:dataExport.confirm.selectOptions",
          onConfirm,
          multipleChoiceOptions,
          confirmButtonTextKey: "common:export",
        }),
      );
    } catch (error) {
      dispatch(handleDataExportError(error));
    }
  };
