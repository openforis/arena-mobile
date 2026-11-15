import { Survey, Surveys } from "@openforis/arena-core";

// undefined for the first cycle (it has no previous one)
const getPrevCycleKey = (
  cycleKey: string | null | undefined,
): string | undefined => {
  const cycleNum = Number(cycleKey);
  return cycleNum > 0 ? String(cycleNum - 1) : undefined;
};

const getPrevCycleKeys = ({
  survey,
  cycleKey,
}: {
  survey: Survey | null | undefined;
  cycleKey: string | null | undefined;
}): string[] => {
  if (!survey || !cycleKey) return [];
  const cycleKeys = Surveys.getCycleKeys(survey);
  const index = cycleKeys.indexOf(cycleKey);
  return index > 0 ? cycleKeys.slice(0, index) : [];
};

const isPreviousCycle = ({
  defaultCycleKey,
  cycleKey,
}: {
  defaultCycleKey: string | null | undefined;
  cycleKey: string | null | undefined;
}): boolean => getPrevCycleKey(defaultCycleKey) === cycleKey;

const labelFunction = (cycleKey: string | null | undefined) =>
  String(Number(cycleKey) + 1);

export const Cycles = {
  getPrevCycleKey,
  getPrevCycleKeys,
  isPreviousCycle,
  labelFunction,
};
