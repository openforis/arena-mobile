import { useCallback, useMemo } from "react";
import { StyleProp, ViewStyle } from "react-native";

import { NodeDefs } from "@openforis/arena-core";

import { Button } from "components";
import { ButtonIconPosition } from "components/Button";
import {
  DataEntryActions,
  DataEntrySelectors,
  SurveySelectors,
  useAppDispatch,
} from "state";

import buttonStyles from "./buttonStyles";

type Props = {
  childDefIndex: number;
  icon?: string;
  iconPosition?: ButtonIconPosition;
  style?: StyleProp<ViewStyle>;
};

export const SingleNodeNavigationButton = (props: Props) => {
  const { childDefIndex, icon, iconPosition, style: styleProp } = props;

  const dispatch = useAppDispatch();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const childDefs = DataEntrySelectors.useCurrentPageEntityRelevantChildDefs();
  const childDef = childDefs[childDefIndex];

  const onPress = useCallback(
    () =>
      dispatch(
        DataEntryActions.selectCurrentPageEntityActiveChildIndex(childDefIndex)
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
      textIsI18nKey={false}
      textKey={NodeDefs.getLabelOrName(childDef, lang)}
      onPress={onPress}
    />
  );
};
