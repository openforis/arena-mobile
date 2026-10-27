import React, { useCallback } from "react";
import { useNavigator } from "navigation/navigator";

import { useTranslation } from "localization";
import { Dropdown } from "components";
import { SurveyActions, SurveySelectors, useAppDispatch } from "state";

export const LocalSurveysDropdown = () => {
  const navigator = useNavigator();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const surveySummaries = SurveySelectors.useSurveysLocal();

  const onChange = useCallback(
    (surveyId: any) => {
      dispatch(
        SurveyActions.fetchAndSetCurrentSurvey({ surveyId, navigator }),
      );
    },
    [dispatch, navigator],
  );

  return (
    <Dropdown
      items={surveySummaries}
      itemKeyExtractor={(item: any) => item.id}
      itemLabelExtractor={(item: any) => item.name}
      label={t("surveys:selectSurvey")}
      onChange={onChange}
      translateItemLabels={false}
      value={null}
    />
  );
};
