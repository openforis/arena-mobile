import { useMemo } from "react";

import { useEffectiveTheme } from "hooks";
import { RecordEditViewMode } from "model";
import { SurveyOptionsSelectors } from "state";

import defaultStyles from "./styles";

export const useDynamicStyles = ({
  selectedTaxonVernacularName
}: any) => {
  const theme = useEffectiveTheme();
  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();

  return useMemo(() => {
    const selectedTaxonContainerStyle = [
      defaultStyles.selectedTaxonContainer,
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      { borderColor: theme.colors.onSurfaceVariant },
      { height: selectedTaxonVernacularName ? 70 : 40 },
    ];
    const containerStyle = [defaultStyles.container];
    if (viewMode === RecordEditViewMode.oneNode) {
      // @ts-expect-error TS(2345): Argument of type '{ flex: number; }' is not assign... Remove this comment to see the full error message
      containerStyle.push(defaultStyles.containerOneNode);
    }
    return { containerStyle, selectedTaxonContainerStyle };
  // @ts-expect-error TS(2532): Object is possibly 'undefined'.
  }, [selectedTaxonVernacularName, theme.colors.onSurfaceVariant, viewMode]);
};
