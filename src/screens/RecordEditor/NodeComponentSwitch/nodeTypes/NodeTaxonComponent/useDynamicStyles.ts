import { useMemo } from "react";

// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useEffectiveTheme } from "hooks";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { RecordEditViewMode } from "model";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
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
      { borderColor: theme.colors.onSurfaceVariant },
      { height: selectedTaxonVernacularName ? 70 : 40 },
    ];
    const containerStyle = [defaultStyles.container];
    if (viewMode === RecordEditViewMode.oneNode) {
      // @ts-expect-error TS(2345): Argument of type '{ flex: number; }' is not assign... Remove this comment to see the full error message
      containerStyle.push(defaultStyles.containerOneNode);
    }
    return { containerStyle, selectedTaxonContainerStyle };
  }, [selectedTaxonVernacularName, theme.colors.onSurfaceVariant, viewMode]);
};
