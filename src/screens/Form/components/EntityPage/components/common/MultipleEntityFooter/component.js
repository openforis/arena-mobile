import {NodeDefs} from '@openforis/arena-core';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import NewItemButton from '../EntityPanel/NewItemButton';

import styles from './styles';

const Footer = () => {
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const isTable = useMemo(
    () =>
      NodeDefs.getLayoutRenderTypePerCycle({
        nodeDef: parentEntityNodeDef,
        cycle,
      }) === 'table',
    [parentEntityNodeDef, cycle],
  );

  if (!parentEntityNodeDef.props.multiple) {
    return <></>;
  }

  if (!isTable) {
    return <></>;
  }

  return (
    <View style={styles.footer}>
      <NewItemButton visible={true} />
    </View>
  );
};

const MultipleEntityFooter = () => {
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  if (!parentEntityNodeDef.props.multiple) {
    return <></>;
  }

  return <Footer />;
};

export default MultipleEntityFooter;
