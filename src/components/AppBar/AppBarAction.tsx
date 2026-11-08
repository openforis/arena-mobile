import { Appbar as RNPAppbar } from "react-native-paper";

type Props = {
  color?: string;
  icon: string;
  loading?: boolean;
  onPress: () => void;
  size?: number;
  testID?: string;
};

export const AppBarAction = (props: Props) => {
  const { color, icon, loading, onPress, size, testID } = props;
  return (
    <RNPAppbar.Action
      color={color}
      icon={icon}
      loading={loading}
      onPress={onPress}
      size={size}
      testID={testID}
    />
  );
};

// the header places its children according to their displayName
AppBarAction.displayName = "Appbar.Action";
