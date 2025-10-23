import React from "react";
import { useDispatch } from "react-redux";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { Surveys } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { Cycles } from "model";
// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Dropdown, HView, SegmentedButtons, Text } from "components";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { SurveyActions, SurveySelectors } from "state";

import styles from "./styles";

export const SurveyCycleSelector = (props: any) => {
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

  const onChange = (selectedCycleKey: any) => {
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
