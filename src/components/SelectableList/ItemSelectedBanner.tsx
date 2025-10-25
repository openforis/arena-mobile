import { useMemo } from "react";
import { Banner } from "react-native-paper";
import PropTypes from "prop-types";

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

export const ItemSelectedBanner = (props: any) => {
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

ItemSelectedBanner.propTypes = {
  canDelete: PropTypes.bool,
  customActions: PropTypes.array,
  onDeleteSelected: PropTypes.func.isRequired,
  selectedItemIds: PropTypes.array.isRequired,
};
