import { useCallback, useMemo } from "react";
import { StyleProp, ViewStyle } from "react-native";

import { NodeDefs, Objects } from "@openforis/arena-core";

import { Button } from "components";
import { ButtonIconPosition, ButtonMode } from "components/Button";
import { DataEntryActions, SurveySelectors, useAppDispatch } from "state";

import buttonStyles from "./buttonStyles";

type Props = {
  entityPointer?: any;
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
        })
      ),
    [dispatch, entityDef.uuid, entityUuid, parentEntityUuid]
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
        (Objects.isEmpty(index) ? "" : `[${index + 1}]`)
      }
      onPress={onPress}
    />
  );
};
