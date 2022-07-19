import * as React from 'react';
import {View, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';

import BreadCrumb from './components/BreadCrumb';
import EntitySelectorToggler from './components/EntitySelectorToggler';
import styles from './styles';

const BreadCrumbs = () => {
  const breadCrumbs = useSelector(formSelectors.getBreadCrumbs);

  return (
    <View style={[styles.container]}>
      <EntitySelectorToggler />

      <ScrollView
        horizontal={true}
        contentContainerStyle={styles.breadCrumbsList}>
        {breadCrumbs.map((breadCrumb, index) => (
          <BreadCrumb
            key={breadCrumb.uuid}
            breadCrumb={breadCrumb}
            isLatests={breadCrumbs.length - 1 === index}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default BreadCrumbs;
