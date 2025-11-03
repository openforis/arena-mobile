import React, { useCallback } from "react";
import { StyleProp, ViewStyle } from "react-native";

import { Surveys } from "@openforis/arena-core";

import { Cycles } from "model";
import { Dropdown, HView, SegmentedButtons, Text } from "components";
import { SurveyActions, SurveySelectors, useAppDispatch } from "state";

import styles from "./styles";

type SurveyCycleSelectorProps = {
  style?: StyleProp<ViewStyle>;
};

const minItemsToShowDropdown = 4;

export const SurveyCycleSelector = (props: SurveyCycleSelectorProps) => {
  const { style } = props;

  const dispatch = useAppDispatch();
  const survey = SurveySelectors.useCurrentSurvey()!;
  const cycle = SurveySelectors.useCurrentSurveyCycle();
  const defaultCycleKey = Surveys.getDefaultCycleKey(survey);
  const cycles = survey?.props?.cycles || {};
  const singleCycle = Object.entries(cycles).length === 1;

  const items = Object.keys(cycles).map((cycleKey) => ({
    value: cycleKey,
    label: Cycles.labelFunction(cycleKey),
  }));

  const selectedValue = singleCycle ? defaultCycleKey : cycle;

  const onChange = useCallback(
    async (selectedCycleKey: any) => {
      dispatch(
        SurveyActions.setCurrentSurveyCycle({ cycleKey: selectedCycleKey })
      );
    },
    [dispatch]
  );

  return (
    <HView style={[styles.formItem, style]}>
      <Text textKey="dataEntry:cycle" />
      {items.length < minItemsToShowDropdown ? (
        <SegmentedButtons
          buttons={items}
          onChange={onChange}
          style={{ width: items.length * 80 }}
          value={selectedValue}
        />
      ) : (
        <Dropdown items={items} onChange={onChange} value={selectedValue} />
      )}
    </HView>
  );
};
