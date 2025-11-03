import { useMemo } from "react";
import {
  SegmentedButtons as RNPSegmentedButtons,
  useTheme,
} from "react-native-paper";
import { StyleProp, ViewStyle } from "react-native";

import { useTranslation } from "localization";

type ButtonItem = {
  icon?: string;
  label?: string;
  value: string;
};

type Props = {
  buttons: ButtonItem[];
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  value?: any;
};

export const SegmentedButtons = (props: Props) => {
  const { buttons, onChange, style, value } = props;

  const { t } = useTranslation();
  const theme = useTheme();

  const buttonsTheme = useMemo(
    () => ({
      colors: {
        secondaryContainer: theme.colors.primary,
        onSecondaryContainer: theme.colors.onPrimary,
      },
    }),
    [theme]
  );

  return (
    <RNPSegmentedButtons
      buttons={buttons.map(({ icon, label, value }: any) => ({
        icon,
        label: t(label),
        value,
      }))}
      onValueChange={onChange}
      style={style}
      theme={buttonsTheme}
      value={value}
    />
  );
};
