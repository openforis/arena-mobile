import { useEffect, useRef, useState } from "react";

import { Surveys } from "@openforis/arena-core";

import { useIsNetworkConnected, useNavigationIsFocused } from "hooks";
import { UpdateStatus } from "model";
import { useCurrentSurveyCoordinator } from "navigation/CurrentSurveyCoordinator";
import { SurveyService } from "service";
import {
  RemoteConnectionSelectors,
  SurveySelectors,
  useAppDispatch,
} from "state";

import {
  determineSurveyUpdateStatus,
  triggerSurveyUpdate,
} from "./surveyUpdateUtils";

export const useHomeScreen = () => {
  const dispatch = useAppDispatch();
  const isFocused = useNavigationIsFocused();
  const networkAvailable = useIsNetworkConnected();
  const survey = SurveySelectors.useCurrentSurvey();
  const user = RemoteConnectionSelectors.useLoggedInUser();
  const { singleSurveyFetchLoading } = useCurrentSurveyCoordinator();

  const [surveyUpdateLoading, setSurveyUpdateLoading] = useState(false);
  const processedSurveyVersionsRef = useRef<Record<string, boolean>>({});

  const surveySelected = !!survey;

  useEffect(() => {
    if (
      !survey ||
      !networkAvailable ||
      !user ||
      survey.uuid === SurveyService.demoSurveyUuid
    ) {
      return;
    }

    const surveyVersion = String(
      // @ts-ignore datePublished is available in persisted surveys but missing from current type
      survey.datePublished ?? survey.dateModified ?? "unknown",
    );
    const surveyKey = `${survey.id}:${surveyVersion}`;

    if (processedSurveyVersionsRef.current[surveyKey]) {
      return;
    }
    processedSurveyVersionsRef.current[surveyKey] = true;

    let cancelled = false;

    const syncSurvey = async () => {
      setSurveyUpdateLoading(true);

      const { updateStatus } = await determineSurveyUpdateStatus({
        networkAvailable,
        survey,
        surveyName: Surveys.getName(survey),
        user,
      });

      if (cancelled) {
        return;
      }

      if (updateStatus !== UpdateStatus.notUpToDate) {
        setSurveyUpdateLoading(false);
        return;
      }

      await triggerSurveyUpdate({
        dispatch,
        survey,
        skipConfirmation: true,
        onComplete: () => {
          if (!cancelled) {
            setSurveyUpdateLoading(false);
          }
        },
      });
    };

    void syncSurvey();

    return () => {
      cancelled = true;
    };
  }, [dispatch, networkAvailable, survey, user]);

  return {
    surveySelected,
    surveyLoadingDialogVisible:
      isFocused && (surveyUpdateLoading || singleSurveyFetchLoading),
    surveyLoadingDialogTitleKey: surveyUpdateLoading
      ? "surveys:updateSurvey"
      : "surveys:selectSurvey",
  };
};
