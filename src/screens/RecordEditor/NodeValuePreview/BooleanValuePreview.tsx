import { useMemo } from "react";

import { Text } from "components";
import { useTranslation } from "localization";
import { RecordNodes } from "model";

import { NodeValuePreviewProps } from "./NodeValuePreviewPropTypes";

export const BooleanValuePreview = (props: NodeValuePreviewProps) => {
  const { nodeDef, value } = props;

  const { t } = useTranslation();

  const valueFormatted = useMemo(
    () => RecordNodes.formatBooleanValue({ nodeDef, value, t }),
    [nodeDef, value, t]
  );

  return <Text>{valueFormatted}</Text>;
};
