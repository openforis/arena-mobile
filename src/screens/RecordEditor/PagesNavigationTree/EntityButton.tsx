import { useCallback, useMemo } from "react";
import { TouchableOpacity } from "react-native";

import { EntityStatusIndicators, HView, Icon, Text } from "components";
import { DataEntryActions, useAppDispatch } from "state";

import styles from "./EntityButtonStyles";

type EntityButtonProps = {
  treeNode: any;
  isCurrentEntity?: boolean;
};

export const EntityButton = (props: EntityButtonProps) => {
  const { treeNode, isCurrentEntity } = props;
  const {
    name,
    iconName,
    isRoot,
    entityPointer,
    hasErrors,
    hasWarnings,
    completionPercent,
  } = treeNode;

  const dispatch = useAppDispatch();

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
    [isCurrentEntity],
  );

  return (
    <TouchableOpacity onPress={onPress} style={styles.entityButtonWrapper}>
      <HView style={styles.entityButtonContent} transparent>
        {!isRoot && <Icon source={iconName} size={16} />}
        <Text style={textStyle} textKey={name} />
        <EntityStatusIndicators
          completionPercent={completionPercent}
          hasErrors={hasErrors}
          hasWarnings={hasWarnings}
        />
      </HView>
    </TouchableOpacity>
  );
};
