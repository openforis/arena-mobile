import { Surveys } from "@openforis/arena-core";

const getPrevCycleKey = (cycleKey) => {
  const cycleNum = Number(cycleKey);
  return cycleNum > 0 ? String(cycleNum - 1) : cycleKey;
};

const getPrevCycleKeys = ({ survey, cycleKey }) => {
  const cycleKeys = Surveys.getCycleKeys(survey);
  const index = cycleKeys.indexOf(cycleKey);
  return cycleKeys.slice(0, index);
};

const isPreviousCycle = ({ defaultCycleKey, cycleKey }) =>
  getPrevCycleKey(defaultCycleKey) === cycleKey;

const labelFunction = (cycleKey) => String(Number(cycleKey) + 1);

export const Cycles = {
  getPrevCycleKey,
  getPrevCycleKeys,
  isPreviousCycle,
  labelFunction,
};
