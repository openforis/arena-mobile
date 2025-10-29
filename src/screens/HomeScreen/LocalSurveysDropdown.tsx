import React, { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import { useTranslation } from "localization";
import { Dropdown } from "components";
import { SurveyActions, SurveySelectors, useAppDispatch } from "state";

export const LocalSurveysDropdown = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const surveySummaries = SurveySelectors.useSurveysLocal();

  const onChange = useCallback(
    async (surveyId: any) => {
      dispatch(
        SurveyActions.fetchAndSetCurrentSurvey({ surveyId, navigation })
      );
    },
    [dispatch, navigation]
  );

  return (
    <Dropdown
      items={surveySummaries}
      itemKeyExtractor={(item: any) => item.id}
      itemLabelExtractor={(item: any) => item.name}
      label={t("surveys:selectSurvey")}
      onChange={onChange}
      value={null}
    />
  );
};
