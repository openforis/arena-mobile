import React, {useRef} from 'react';
import {View, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as formSelectors} from 'state/form';

import BreadCrumb from './components/BreadCrumb';
import EntitySelectorToggler from './components/EntitySelectorToggler';
import _styles from './styles';

const BreadCrumbs = () => {
  const breadCrumbs = useSelector(formSelectors.getBreadCrumbs);
  const styles = useThemedStyles({styles: _styles});
  const scrollViewRef = useRef();

  return (
    <View style={[styles.container]}>
      <View style={styles.entitySelectorButton}>
        <EntitySelectorToggler />
      </View>

      <ScrollView
        horizontal={true}
        contentContainerStyle={styles.breadCrumbsList}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current.scrollToEnd({animated: true})
        }>
        {breadCrumbs.map((breadCrumb, index) => (
          <View key={breadCrumb.uuid} style={styles.breadCrumbContainer}>
            <BreadCrumb
              breadCrumb={breadCrumb}
              isLatests={breadCrumbs.length - 1 === index}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default BreadCrumbs;
