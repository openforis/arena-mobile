import React, { useCallback } from "react";
import { useDispatch } from "react-redux";

import { Languages } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Dropdown, HView, Text } from "components";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { SurveyActions, SurveySelectors } from "state";

import styles from "./styles";

export const SurveyLanguageSelector = () => {
  const dispatch = useDispatch();
  const survey = SurveySelectors.useCurrentSurvey();
  const preferredLang = SurveySelectors.useCurrentSurveyPreferredLang();

  const languages = survey.props.languages;
  const singleLanguage = languages.length === 1;

  // @ts-expect-error TS(2532): Object is possibly 'undefined'.
  const langLabelFn = (langCode: any) => Languages[langCode]["en"];

  const items = languages.map((langCode: any) => ({
    value: langCode,
    label: langLabelFn(langCode)
  }));

  const selectedValue = singleLanguage ? languages[0] : preferredLang;

  const onChange = useCallback(
    (lang: any) => {
      dispatch(SurveyActions.setCurrentSurveyPreferredLanguage({ lang }));
    },
    [dispatch]
  );

  return (
    <HView style={styles.formItem}>
      <Text style={styles.formItemLabel} textKey="dataEntry:formLanguage" />
      {singleLanguage ? (
        <Text textKey={langLabelFn(selectedValue)} />
      ) : (
        <Dropdown
          disabled={singleLanguage}
          items={items}
          onChange={onChange}
          showLabel={false}
          value={selectedValue}
        />
      )}
    </HView>
  );
};
