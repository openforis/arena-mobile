import { Surveys } from "@openforis/arena-core";

const getPrevCycleKey = (cycleKey: any) => {
  const cycleNum = Number(cycleKey);
  return cycleNum > 0 ? String(cycleNum - 1) : cycleKey;
};

const getPrevCycleKeys = ({
  survey,
  cycleKey
}: any) => {
  const cycleKeys = Surveys.getCycleKeys(survey);
  const index = cycleKeys.indexOf(cycleKey);
  return cycleKeys.slice(0, index);
};

const isPreviousCycle = ({
  defaultCycleKey,
  cycleKey
}: any) =>
  getPrevCycleKey(defaultCycleKey) === cycleKey;

const labelFunction = (cycleKey: any) => String(Number(cycleKey) + 1);

export const Cycles = {
  getPrevCycleKey,
  getPrevCycleKeys,
  isPreviousCycle,
  labelFunction,
};
