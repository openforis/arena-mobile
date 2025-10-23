import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { NodeDefs } from "@openforis/arena-core";

import { Button } from "components";
import { DataEntryActions, DataEntrySelectors, SurveySelectors } from "state";

import buttonStyles from "./buttonStyles";

export const SingleNodeNavigationButton = (props: any) => {
  const { childDefIndex, icon, iconPosition, style: styleProp } = props;

  const dispatch = useDispatch();
  const lang = SurveySelectors.useCurrentSurveyPreferredLang();
  const childDefs = DataEntrySelectors.useCurrentPageEntityRelevantChildDefs();
  const childDef = childDefs[childDefIndex];

  const onPress = useCallback(
    () =>
      dispatch(
        // @ts-expect-error TS(2345): Argument of type '(dispatch: any, getState: any) =... Remove this comment to see the full error message
        DataEntryActions.selectCurrentPageEntityActiveChildIndex(childDefIndex)
      ),
    [childDefIndex, dispatch]
  );

  const style = useMemo(() => [buttonStyles.button, styleProp], [styleProp]);

  return (
    <Button
      icon={icon}
      iconPosition={iconPosition}
      style={style}
      // @ts-expect-error TS(2345): Argument of type 'NodeDef<NodeDefType, NodeDefProp... Remove this comment to see the full error message
      textKey={NodeDefs.getLabelOrName(childDef, lang)}
      onPress={onPress}
    />
  );
};

SingleNodeNavigationButton.propTypes = {
  childDefIndex: PropTypes.number,
  icon: PropTypes.string,
  iconPosition: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
