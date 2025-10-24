import React, { useCallback } from "react";
import { useDispatch } from "react-redux";

import { LanguageCode, Languages } from "@openforis/arena-core";

import { Dropdown, HView, Text } from "components";
import { SurveyActions, SurveySelectors } from "state";

import styles from "./styles";

export const SurveyLanguageSelector = () => {
  const dispatch = useDispatch();
  const survey = SurveySelectors.useCurrentSurvey()!;
  const preferredLang = SurveySelectors.useCurrentSurveyPreferredLang();

  const languages = survey.props.languages;
  const singleLanguage = languages.length === 1;

  const langLabelFn = (langCode: LanguageCode) => Languages[langCode]?.["en"];

  const items = languages.map((langCode: any) => ({
    value: langCode,
    label: langLabelFn(langCode),
  }));

  const selectedValue = singleLanguage ? languages[0] : preferredLang;

  const onChange = useCallback(
    (lang: any) => {
      dispatch(
        SurveyActions.setCurrentSurveyPreferredLanguage({ lang }) as never
      );
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
