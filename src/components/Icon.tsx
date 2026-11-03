import { Icon as RNPIcon, useTheme } from "react-native-paper";

type Props = {
  color?: string;
  size?: number;
  source: string;
};

export const Icon = (props: Props) => {
  const { color: colorProp = undefined, size = 20, source } = props;
  const theme = useTheme();
  const color = colorProp ?? theme.colors.onBackground;
  return <RNPIcon color={color} size={size} source={source} />;
};
