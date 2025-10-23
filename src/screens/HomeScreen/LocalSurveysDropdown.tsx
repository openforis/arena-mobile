import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useTranslation } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Dropdown } from "components";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { SurveyActions, SurveySelectors } from "state";

export const LocalSurveysDropdown = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
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
