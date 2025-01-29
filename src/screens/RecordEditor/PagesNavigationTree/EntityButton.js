import { useCallback, useMemo } from "react";
import { TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { AlertIcon, HView, Text } from "components";
import { DataEntryActions } from "state";

import styles from "./EntityButtonStyles";

export const EntityButton = (props) => {
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
