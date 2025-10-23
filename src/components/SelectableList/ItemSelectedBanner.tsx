import { useMemo } from "react";
import { Banner } from "react-native-paper";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
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

  // @ts-expect-error TS(2741): Property 'children' is missing in type '{ actions:... Remove this comment to see the full error message
  return <Banner actions={actions} visible={selectedItemIds.length > 0} />;
};

ItemSelectedBanner.propTypes = {
  canDelete: PropTypes.bool,
  customActions: PropTypes.array,
  onDeleteSelected: PropTypes.func.isRequired,
  selectedItemIds: PropTypes.array.isRequired,
};
