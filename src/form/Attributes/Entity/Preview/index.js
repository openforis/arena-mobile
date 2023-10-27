import {NodeDefs} from '@openforis/arena-core';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';

import {defaultCycle} from 'arena/config';
import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import _styles from './styles';
NodeDefs.isHiddenWhenNotRelevant =
  (cycle = defaultCycle) =>
  nodeDef => {
    return nodeDef?.props?.layout?.[cycle]?.hiddenWhenNotRelevant;
  };

const Preview = ({nodeDef}) => {
  const styles = useThemedStyles(_styles);
  const label = useNodeDefNameOrLabel({nodeDef});
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const disabled = useSelector(state =>
    formSelectors.isNodeDefDisabled(state, nodeDef),
  );

  const dispatch = useDispatch();
  const handleSelect = useCallback(() => {
    dispatch(
      formActions.selectEntity({
        nodeDef,
      }),
    );
  }, [nodeDef, dispatch]);

  if (!applicable && NodeDefs.isHiddenWhenNotRelevant(cycle)(nodeDef)) {
    return <></>;
  }
  return (
    <View style={styles.container}>
      <Button
        onPress={handleSelect}
        type="secondary"
        iconPosition="right"
        label={`${label} (${nodes?.length})`}
        icon={
          <Icon
            name="table-large"
            color={
              disabled
                ? styles.colors.neutralLighter
                : styles.colors.primaryText
            }
          />
        }
        disabled={disabled}
        customContainerStyle={disabled ? styles.disabled : {}}
        customTextStyle={disabled ? styles.disabled : {}}
      />
    </View>
  );
};

export default Preview;
