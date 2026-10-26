import { Icon } from "components/Icon";
import { BatteryState } from "model/BatteryState";
import { useAppTheme } from "theme";

const getBatteryIconSource = ({ batteryLevel, batteryState }: any) => {
  if (batteryLevel < 0.1) return "battery-alert-variant-outline";
  const suffix = batteryState === BatteryState.charging ? "-charging" : "";
  const iconName = `battery${suffix}`;
  if (batteryLevel > 0.9) return iconName;
  const batteryLevelDec = Math.ceil(batteryLevel * 10) * 10;
  return `${iconName}-${batteryLevelDec}`; // e.g. battery-level-50 or battery-level-50-charging
};

type BatteryIconProps = {
  batteryLevel: number;
  batteryState?: string;
};

export const BatteryIcon = (props: BatteryIconProps) => {
  const { batteryLevel, batteryState } = props;
  const theme = useAppTheme();
  const color =
    batteryLevel < 0.2 ? theme.colors.error : theme.colors.onBackground;
  const iconSource = getBatteryIconSource({ batteryLevel, batteryState });

  return <Icon color={color} source={iconSource} />;
};
