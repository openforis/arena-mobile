import { useMemo } from "react";

import { useEffectiveTheme } from "hooks";
import { RecordEditViewMode } from "model";
import { SurveyOptionsSelectors } from "state";

import defaultStyles from "./styles";

export const useDynamicStyles = ({ selectedTaxonVernacularName }) => {
  const theme = useEffectiveTheme();
  const viewMode = SurveyOptionsSelectors.useRecordEditViewMode();

  return useMemo(() => {
    const selectedTaxonContainerStyle = [
      defaultStyles.selectedTaxonContainer,
      { borderColor: theme.colors.onSurfaceVariant },
      { height: selectedTaxonVernacularName ? 70 : 40 },
    ];
    const containerStyle = [defaultStyles.container];
    if (viewMode === RecordEditViewMode.oneNode) {
      containerStyle.push(defaultStyles.containerOneNode);
    }
    return { containerStyle, selectedTaxonContainerStyle };
  }, [selectedTaxonVernacularName, theme.colors.onSurfaceVariant, viewMode]);
};
