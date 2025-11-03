import { useTheme } from "react-native-paper";
import RNPIcon from "react-native-paper/src/components/Icon";

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
