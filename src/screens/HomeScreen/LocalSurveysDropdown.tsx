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
    async (surveyId: any) => {
      dispatch(
        // @ts-expect-error TS(2345): Argument of type '(dispatch: any) => Promise<void>... Remove this comment to see the full error message
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
