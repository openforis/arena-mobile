import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { StyleProp, ViewStyle } from "react-native";

import { NodeDefs } from "@openforis/arena-core";

import { Button } from "components";
import { ButtonIconPosition } from "components/Button";
import { DataEntryActions, DataEntrySelectors, SurveySelectors } from "state";

import buttonStyles from "./buttonStyles";

type Props = {
  childDefIndex: number;
  icon?: string;
  iconPosition?: ButtonIconPosition;
  style?: StyleProp<ViewStyle>;
};

export const SingleNodeNavigationButton = (props: Props) => {
  const { childDefIndex, icon, iconPosition, style: styleProp } = props;

  const dispatch = useDispatch();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const childDefs = DataEntrySelectors.useCurrentPageEntityRelevantChildDefs();
  const childDef = childDefs[childDefIndex];

  const onPress = useCallback(
    () =>
      dispatch(
        DataEntryActions.selectCurrentPageEntityActiveChildIndex(
          childDefIndex
        ) as never
      ),
    [childDefIndex, dispatch]
  );

  const style = useMemo(() => [buttonStyles.button, styleProp], [styleProp]);

  if (!childDef) return null;

  return (
    <Button
      icon={icon}
      iconPosition={iconPosition}
      style={style}
      textKey={NodeDefs.getLabelOrName(childDef, lang)}
      onPress={onPress}
    />
  );
};
