import { Card as RNPCard } from "react-native-paper";

import { useTranslation } from "localization";
import { StyleProp, ViewStyle } from "react-native";

type Props = {
  children?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  titleKey?: string;
};

export const Card = (props: Props) => {
  const { children, contentStyle, style, titleKey } = props;

  const { t } = useTranslation();

  const title = titleKey ? t(titleKey) : null;
  return (
    <RNPCard style={style}>
      {title && <RNPCard.Title title={title} titleVariant="titleMedium" />}
      <RNPCard.Content style={contentStyle}>{children}</RNPCard.Content>
    </RNPCard>
  );
};
