import React from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { Surveys } from "@openforis/arena-core";

import { Cycles } from "model";
import { Dropdown, HView, SegmentedButtons, Text } from "components";
import { SurveyActions, SurveySelectors } from "state";

import styles from "./styles";

export const SurveyCycleSelector = (props) => {
  const { style } = props;

  const dispatch = useDispatch();
  const survey = SurveySelectors.useCurrentSurvey();
  const cycle = SurveySelectors.useCurrentSurveyCycle();
  const defaultCycleKey = Surveys.getDefaultCycleKey(survey);
  const cycles = survey?.props?.cycles || {};
  const singleCycle = Object.entries(cycles).length === 1;

  const items = Object.keys(cycles).map((cycleKey) => ({
    value: cycleKey,
    label: Cycles.labelFunction(cycleKey),
  }));

  const selectedValue = singleCycle ? defaultCycleKey : cycle;

  const onChange = (selectedCycleKey) => {
    dispatch(
      SurveyActions.setCurrentSurveyCycle({ cycleKey: selectedCycleKey })
    );
  };

  return (
    <HView style={[styles.formItem, style]}>
      <Text textKey="dataEntry:cycle" />
      {items.length <= 3 ? (
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

SurveyCycleSelector.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
