import { useCallback, useMemo } from "react";
import { TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { AlertIcon, HView, Text } from "components";
import { DataEntryActions } from "state";

import styles from "./EntityButtonStyles";

export const EntityButton = (props: any) => {
  const { treeNode, isCurrentEntity } = props;
  const { label, entityPointer, hasErrors, hasWarnings } = treeNode;

  const dispatch = useDispatch();

  const onPress = useCallback(() => {
    // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
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
