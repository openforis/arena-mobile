import { useCallback, useMemo } from "react";
import { TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { AlertIcon, HView, Text } from "components";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { DataEntryActions } from "state";

import styles from "./EntityButtonStyles";

export const EntityButton = (props: any) => {
  const { treeNode, isCurrentEntity } = props;
  const { label, entityPointer, hasErrors, hasWarnings } = treeNode;

  const dispatch = useDispatch();

  const onPress = useCallback(() => {
    dispatch(DataEntryActions.selectCurrentPageEntity(entityPointer));
  }, [dispatch, entityPointer]);

  const textStyle = useMemo(
    () => [
      styles.entityButtonText,
      isCurrentEntity
        ? styles.entityButtonCurrentEntityText
        : styles.entityButtonNonCurrentEntityText,
    ],
    [isCurrentEntity]
  );

  return (
    <TouchableOpacity onPress={onPress} style={styles.entityButtonWrapper}>
      <HView style={styles.entityButtonContent} transparent>
        <Text style={textStyle} textKey={label} />
        <AlertIcon hasErrors={hasErrors} hasWarnings={hasWarnings} />
      </HView>
    </TouchableOpacity>
  );
};

EntityButton.propTypes = {
  treeNode: PropTypes.object.isRequired,
  isCurrentEntity: PropTypes.bool,
};
