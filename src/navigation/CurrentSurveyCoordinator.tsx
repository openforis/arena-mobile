import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useIsMountedRef, useIsNetworkConnected } from "hooks";
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
  const isMountedRef = useIsMountedRef();

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

    const fetchAndSetSingleSurvey = async () => {
      singleSurveyFetchInProgressRef.current = true;
      setSingleSurveyFetchLoading(true);

      try {
        await dispatch(SurveyActions.fetchAndSetRemoteSurveyIfOnlyOne());
      } finally {
        singleSurveyFetchInProgressRef.current = false;
        if (isMountedRef.current) {
          setSingleSurveyFetchLoading(false);
        }
      }
    };

    void fetchAndSetSingleSurvey();
  }, [dispatch, isMountedRef, networkAvailable, surveySelected, user]);

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
