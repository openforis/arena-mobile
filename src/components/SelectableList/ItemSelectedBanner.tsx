import { useMemo } from "react";
import { Surface } from "react-native-paper";

import { useEffectiveTheme } from "hooks";
import { useTranslation } from "localization";

import { Button, ButtonProps } from "../Button";
import { FlexWrapView } from "../FlexWrapView";

import styles from "./styles";

export type SelectedItemsAction = {
  key: string;
  icon?: string;
  labelKey: string;
  labelParams?: Record<string, any>;
  mode?: ButtonProps["mode"];
  onPress: () => void;
  textColor?: string;
};

const customActionToButtonProps = ({
  t,
  customAction,
}: {
  t: (key?: string | null, params?: any) => string;
  customAction: SelectedItemsAction;
}): ButtonProps & { key: string } => {
  const { key, labelKey, labelParams, mode = "text", onPress, ...otherProps } =
    customAction;
  return {
    key,
    children: t(labelKey, labelParams),
    mode,
    onPress,
    ...otherProps,
  };
};

type Props = {
  canDelete?: boolean;
  customActions?: SelectedItemsAction[];
  onDeleteSelected: () => void;
  selectedItemIds: any[];
};

export const ItemSelectedBanner = (props: Props) => {
  const {
    canDelete,
    onDeleteSelected,
    selectedItemIds,
    customActions = [],
  } = props;

  const { t } = useTranslation();
  const theme = useEffectiveTheme();

  const actions = useMemo(() => {
    const result = [...customActions];
    if (canDelete) {
      result.push({
        key: "deleteSelectedItems",
        icon: "trash-can-outline",
        labelKey: "common:delete",
        onPress: onDeleteSelected,
        textColor: theme?.colors.error,
      });
    }
    return result.map((customAction) =>
      customActionToButtonProps({ t, customAction }),
    );
  }, [canDelete, customActions, onDeleteSelected, t, theme]);

  if (selectedItemIds.length === 0) return null;

  return (
    <Surface elevation={1} style={styles.selectedItemsBanner}>
      <FlexWrapView style={styles.selectedItemsBannerActions}>
        {actions.map(({ key, ...action }) => (
          <Button key={key} compact {...action} />
        ))}
      </FlexWrapView>
    </Surface>
  );
};
