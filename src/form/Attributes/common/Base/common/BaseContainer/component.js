import {NodeDefs} from '@openforis/arena-core';
import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import AttributeHeader from 'form/common/Header';
import {selectors as formSelectors} from 'state/form';
import formPreferencesSelectors from 'state/form/selectors/preferences';
import {selectors as nodesSelectors} from 'state/nodes';
import {selectors as surveySelectors} from 'state/survey';

import {useIsDisabled} from '../hooks';

import _styles from './styles';

const _BaseContainer = ({nodeDef, nodes, children}) => {
  const styles = useThemedStyles(_styles);
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );
  const isSingleNodeView = useSelector(formSelectors.isSingleNodeView);

  const showDescriptions = useSelector(
    formPreferencesSelectors.showDescriptions,
  );
  const disabled = useIsDisabled(nodeDef, nodes);

  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const lastNodeDefUuid = useSelector(nodesSelectors.getLastNodeDefUuid);
  const containerStyle = useMemo(() => {
    return StyleSheet.compose(
      StyleSheet.compose(styles.container, disabled ? styles.disabled : {}),
      !isSingleNodeView && lastNodeDefUuid === nodeDef.uuid
        ? styles.lastNodeDef
        : {},
    );
  }, [isSingleNodeView, styles, disabled, lastNodeDefUuid, nodeDef]);

  const hidden = useMemo(() => {
    const layoutProps = NodeDefs.getLayoutProps(cycle)(nodeDef);

    return (
      !applicable &&
      NodeDefs.isHiddenWhenNotRelevant(cycle)(nodeDef) &&
      layoutProps.hiddenInMobile
    );
  }, [applicable, cycle, nodeDef]);

  const header = useMemo(() => {
    return (
      <AttributeHeader
        nodeDef={nodeDef}
        nodes={nodes}
        showDescription={showDescriptions}
        disabled={disabled}
      />
    );
  }, [nodeDef, nodes, disabled, showDescriptions]);

  if (hidden) {
    return <></>;
  }

  return (
    <View style={containerStyle}>
      {header}
      {children}
    </View>
  );
};

export const BaseContainer = ({nodeDef, nodes, children}) => {
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const cycle = useSelector(surveySelectors.getSurveyCycle);

  const hidden = useMemo(() => {
    return !applicable && NodeDefs.isHiddenWhenNotRelevant(cycle)(nodeDef);
  }, [applicable, cycle, nodeDef]);

  if (hidden) {
    return <></>;
  }

  return (
    <_BaseContainer nodeDef={nodeDef} nodes={nodes}>
      {children}
    </_BaseContainer>
  );
};

export default BaseContainer;
