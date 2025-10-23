// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { useTranslation } from "localization";

import { HView } from "./HView";
import { Text } from "./Text";

export const FormItem = ({
  children,
  labelKey,
  labelNumberOfLines = undefined,
  labelStyle = undefined,
  labelVariant = "labelLarge",
  style,
  textVariant = "bodyLarge"
}: any) => {
  const { t } = useTranslation();
  const label = `${t(labelKey)}:`;
  const hasTextContent =
    typeof children === "string" || typeof children === "number";

  return (
    // @ts-expect-error TS(2709): Cannot use namespace 'HView' as a type.
    <HView style={[{ alignItems: "baseline" }, style]}>
      <Text
        // @ts-expect-error TS(7027): Unreachable code detected.
        numberOfLines={labelNumberOfLines}
        style={labelStyle}
        // @ts-expect-error TS(2304): Cannot find name 'variant'.
        variant={labelVariant}
      >
        {label}
      </Text>
      {hasTextContent ? (
        // @ts-expect-error TS(2304): Cannot find name 'variant'.
        <Text variant={textVariant}>{children}</Text>
      ) : (
        // @ts-expect-error TS(2304): Cannot find name 'children'.
        children
      )}
    </HView>
  );
};

FormItem.propTypes = {
  children: PropTypes.node,
  labelKey: PropTypes.string.isRequired,
  labelNumberOfLines: PropTypes.number,
  labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  labelVariant: PropTypes.string,
  style: PropTypes.object,
  textVariant: PropTypes.string,
};
