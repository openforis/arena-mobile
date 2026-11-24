import { useCallback, useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { ArenaAnyNodeDef, NodeDefs, Objects } from "@openforis/arena-core";

import { Button } from "components";
import { ButtonIconPosition, ButtonMode } from "components/Button";
import { DataEntryActions, SurveySelectors, useAppDispatch } from "state";

import buttonStyles from "./buttonStyles";

// entity page pointer returned by RecordPageNavigator
type EntityPagePointer = {
  parentEntityUuid?: string;
  entityDef: ArenaAnyNodeDef;
  entityUuid?: string | null;
  index?: number;
};

type Props = {
  entityPointer: EntityPagePointer;
  icon?: string;
  iconPosition?: ButtonIconPosition;
  mode?: ButtonMode;
  style?: StyleProp<ViewStyle>;
};

export const NodePageNavigationButton = (props: Props) => {
  const { entityPointer, icon, iconPosition, mode, style: styleProp } = props;

  const { parentEntityUuid, entityDef, entityUuid, index } = entityPointer;

  const dispatch = useAppDispatch();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();

  const onPress = useCallback(
    () =>
      dispatch(
        DataEntryActions.selectCurrentPageEntity({
          parentEntityUuid,
          entityDefUuid: entityDef.uuid,
          entityUuid,
        }),
      ),
    [dispatch, entityDef.uuid, entityUuid, parentEntityUuid],
  );

  const style = useMemo(() => [buttonStyles.button, styleProp], [styleProp]);

  return (
    <Button
      icon={icon}
      iconPosition={iconPosition}
      mode={mode}
      style={style}
      textIsI18nKey={false}
      textKey={
        NodeDefs.getLabelOrName(entityDef, lang) +
        (Objects.isEmpty(index) ? "" : `[${index! + 1}]`)
      }
      onPress={onPress}
    />
  );
};
