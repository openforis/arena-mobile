import { useMemo } from "react";
import { Banner } from "react-native-paper";

import { useTranslation } from "localization";

const customActionToAction = ({
  t,
  customAction
}: any) => {
  const {
    labelKey,
    labelParams,
    mode = "outlined",
    onPress,
    ...otherProps
  } = customAction;
  return { label: t(labelKey, labelParams), mode, onPress, ...otherProps };
};

type Props = {
  canDelete?: boolean;
  customActions?: any[];
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

  const actions = useMemo(() => {
    const result = [...customActions];
    if (canDelete) {
      result.push({
        icon: "trash-can-outline",
        labelKey: "common:delete",
        onPress: onDeleteSelected,
      });
    }
    return result.map((customAction) =>
      customActionToAction({ t, customAction })
    );
  }, [canDelete, customActions, onDeleteSelected, t]);

  return <Banner actions={actions} visible={selectedItemIds.length > 0}>
    <>{/* undefined children not allowed*/}</>
    </Banner>;
};
