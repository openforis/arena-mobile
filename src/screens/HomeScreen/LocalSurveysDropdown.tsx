import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import { useTranslation } from "localization";
import { Dropdown } from "components";
import { SurveyActions, SurveySelectors } from "state";

export const LocalSurveysDropdown = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const surveySummaries = SurveySelectors.useSurveysLocal();

  const onChange = useCallback(
    async (surveyId) => {
      dispatch(
        SurveyActions.fetchAndSetCurrentSurvey({ surveyId, navigation })
      );
    },
    [dispatch, navigation]
  );

  return (
    <Dropdown
      items={surveySummaries}
      itemKeyExtractor={(item) => item.id}
      itemLabelExtractor={(item) => item.name}
      label={t("surveys:selectSurvey")}
      onChange={onChange}
      value={null}
    />
  );
};
