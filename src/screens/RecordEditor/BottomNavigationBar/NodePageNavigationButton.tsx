import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { NodeDefs, Objects } from "@openforis/arena-core";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Button } from "components";
// @ts-expect-error TS(2307): Cannot find module 'state' or its corresponding ty... Remove this comment to see the full error message
import { DataEntryActions, SurveySelectors } from "state";

import buttonStyles from "./buttonStyles";

export const NodePageNavigationButton = (props: any) => {
  const { entityPointer, icon, iconPosition, mode, style: styleProp } = props;

  const { parentEntityUuid, entityDef, entityUuid, index } = entityPointer;

  const dispatch = useDispatch();
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
      textKey={
        NodeDefs.getLabelOrName(entityDef, lang) +
        (Objects.isEmpty(index) ? "" : `[${index + 1}]`)
      }
      onPress={onPress}
    />
  );
};

NodePageNavigationButton.propTypes = {
  entityPointer: PropTypes.object,
  icon: PropTypes.string,
  iconPosition: PropTypes.string,
  mode: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
