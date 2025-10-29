import React, { useCallback, useMemo } from "react";

import { LanguageCode, Languages, Surveys } from "@openforis/arena-core";

import { Dropdown, HView, Text } from "components";
import { SurveyActions, SurveySelectors, useAppDispatch } from "state";

import styles from "./styles";

export const SurveyLanguageSelector = () => {
  const dispatch = useAppDispatch();
  const survey = SurveySelectors.useCurrentSurvey()!;
  const preferredLang = SurveySelectors.useCurrentSurveyPreferredLang();

  const languages = Surveys.getLanguages(survey);
  const singleLanguage = languages.length === 1;

  const langLabelFn = useCallback(
    (langCode: LanguageCode) => Languages[langCode]?.[LanguageCode.en],
    []
  );

  const items = useMemo(
    () =>
      languages.map((langCode: any) => ({
        value: langCode,
        label: langLabelFn(langCode),
      })),
    [languages]
  );

  const selectedValue = singleLanguage ? languages[0] : preferredLang;

  const onChange = useCallback(
    async (lang: any) => {
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
