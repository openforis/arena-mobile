import { StyleProp, TextStyle } from "react-native";

import { useTranslation } from "localization";

import { HView } from "./HView";
import { Text } from "./Text";

type Props = {
  children?: React.ReactNode;
  labelKey: string;
  labelNumberOfLines?: number;
  labelStyle?: StyleProp<TextStyle>;
  labelVariant?: string;
  style?: any;
  textVariant?: string;
};

export const FormItem = ({
  children,
  labelKey,
  labelNumberOfLines = undefined,
  labelStyle = undefined,
  labelVariant = "labelLarge",
  style,
  textVariant = "bodyLarge",
}: Props) => {
  const { t } = useTranslation();
  const label = `${t(labelKey)}:`;
  const hasTextContent =
    typeof children === "string" || typeof children === "number";

  return (
    <HView style={[{ alignItems: "baseline" }, style]}>
      <Text
        numberOfLines={labelNumberOfLines}
        style={labelStyle}
        variant={labelVariant as any}
      >
        {label}
      </Text>
      {hasTextContent ? (
        <Text variant={textVariant as any}>{children}</Text>
      ) : (
        children
      )}
    </HView>
  );
};
