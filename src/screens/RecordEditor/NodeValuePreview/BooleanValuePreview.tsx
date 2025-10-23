import { useMemo } from "react";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Text } from "components";
// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useTranslation } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'model' or its corresponding ty... Remove this comment to see the full error message
import { RecordNodes } from "model";

import { NodeValuePreviewPropTypes } from "./NodeValuePreviewPropTypes";

export const BooleanValuePreview = (props: any) => {
  const { nodeDef, value } = props;

  const { t } = useTranslation();

  const valueFormatted = useMemo(
    () => RecordNodes.formatBooleanValue({ nodeDef, value, t }),
    [nodeDef, value, t]
  );

  return <Text>{valueFormatted}</Text>;
};

BooleanValuePreview.propTypes = NodeValuePreviewPropTypes;
