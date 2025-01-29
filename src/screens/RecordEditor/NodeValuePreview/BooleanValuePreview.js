import { useCallback } from "react";

import { Text } from "components";
import { useTranslation } from "localization";

import { NodeValuePreviewPropTypes } from "./NodeValuePreviewPropTypes";

const yesNoValueByBooleanValue = {
  true: "yes",
  false: "no",
};

export const BooleanValuePreview = (props) => {
  const { nodeDef, value } = props;

  const { t } = useTranslation();

  const labelValue = nodeDef.props.labelValue ?? "trueFalse";

  const getLabelKey = useCallback(
    (booleanValue) =>
      labelValue === "trueFalse"
        ? booleanValue
        : yesNoValueByBooleanValue[booleanValue],
    [labelValue]
  );

  const valueFormatted = t(`common:${getLabelKey(value)}`);

  return <Text>{valueFormatted}</Text>;
};

BooleanValuePreview.propTypes = NodeValuePreviewPropTypes;
