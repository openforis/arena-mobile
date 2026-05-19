import { useMemo } from "react";
import { Banner } from "react-native-paper";

import { useScreenWidth } from "hooks";
import { useTranslation } from "localization";

const customActionToAction = ({ t, customAction }: any) => {
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
      customActionToAction({ t, customAction }),
    );
  }, [canDelete, customActions, onDeleteSelected, t]);

  // limit max width of banner to screen width, to avoid scrolling when device is in landscape orientation
  const screenWidth = useScreenWidth();
  const style = useMemo(() => ({ maxWidth: screenWidth }), [screenWidth]);

  return (
    <Banner
      actions={actions}
      style={style}
      visible={selectedItemIds.length > 0}
    >
      <>{/* undefined children not allowed*/}</>
    </Banner>
  );
};
