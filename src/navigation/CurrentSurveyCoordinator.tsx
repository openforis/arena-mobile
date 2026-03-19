import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useIsNetworkConnected } from "hooks";
import {
  RemoteConnectionSelectors,
  SurveyActions,
  SurveySelectors,
  useAppDispatch,
} from "state";

type CurrentSurveyCoordinatorContextValue = {
  singleSurveyFetchLoading: boolean;
};

const CurrentSurveyCoordinatorContext =
  createContext<CurrentSurveyCoordinatorContextValue>({
    singleSurveyFetchLoading: false,
  });

type Props = {
  children: React.ReactNode;
};

export const CurrentSurveyCoordinator = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const networkAvailable = useIsNetworkConnected();
  const survey = SurveySelectors.useCurrentSurvey();
  const user = RemoteConnectionSelectors.useLoggedInUser();

  const [singleSurveyFetchLoading, setSingleSurveyFetchLoading] =
    useState(false);
  const singleSurveyFetchInProgressRef = useRef(false);

  const surveySelected = !!survey;

  useEffect(() => {
    if (
      singleSurveyFetchInProgressRef.current ||
      !networkAvailable ||
      !user ||
      surveySelected
    ) {
      return;
    }

    let cancelled = false;

    const fetchAndSetSingleSurvey = async () => {
      singleSurveyFetchInProgressRef.current = true;
      setSingleSurveyFetchLoading(true);

      try {
        await dispatch(SurveyActions.fetchAndSetRemoteSurveyIfOnlyOne());
      } finally {
        singleSurveyFetchInProgressRef.current = false;
        if (!cancelled) {
          setSingleSurveyFetchLoading(false);
        }
      }
    };

    void fetchAndSetSingleSurvey();

    return () => {
      cancelled = true;
    };
  }, [dispatch, networkAvailable, surveySelected, user]);

  return (
    <CurrentSurveyCoordinatorContext.Provider
      value={{ singleSurveyFetchLoading }}
    >
      {children}
    </CurrentSurveyCoordinatorContext.Provider>
  );
};

export const useCurrentSurveyCoordinator = () =>
  useContext(CurrentSurveyCoordinatorContext);
