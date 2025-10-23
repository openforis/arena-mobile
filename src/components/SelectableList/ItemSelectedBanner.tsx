import { useMemo } from "react";
import { Banner } from "react-native-paper";
import PropTypes from "prop-types";

import { useTranslation } from "localization";

const customActionToAction = ({ t, customAction }) => {
  const {
    labelKey,
    labelParams,
    mode = "outlined",
    onPress,
    ...otherProps
  } = customAction;
  return { label: t(labelKey, labelParams), mode, onPress, ...otherProps };
};

export const ItemSelectedBanner = (props) => {
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

  return <Banner actions={actions} visible={selectedItemIds.length > 0} />;
};

ItemSelectedBanner.propTypes = {
  canDelete: PropTypes.bool,
  customActions: PropTypes.array,
  onDeleteSelected: PropTypes.func.isRequired,
  selectedItemIds: PropTypes.array.isRequired,
};
