import React, {useCallback, useMemo, useRef} from 'react';
import {View, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as formSelectors} from 'state/form';

import BreadCrumb from './components/BreadCrumb';
import EntitySelectorToggler from './components/EntitySelectorToggler';
import _styles from './styles';
import CloseForm from './components/CloseForm';

const useBreadCrumbsUuids = () => {
  const breadCrumbs = useSelector(formSelectors.getBreadCrumbs);

  const breadCrumbsUuids = useMemo(() => {
    return breadCrumbs.map(node => node.uuid);
  }, [breadCrumbs]);

  return breadCrumbsUuids;
};

const BreadCrumbsItems = () => {
  const breadCrumbsUuids = useBreadCrumbsUuids();

  const breadCrumbs = useMemo(
    () =>
      breadCrumbsUuids.map(nodeUuid => {
        return <BreadCrumb key={nodeUuid} nodeUuid={nodeUuid} />;
      }),
    [breadCrumbsUuids],
  );

  return <>{breadCrumbs}</>;
};

const BreadCrumbsList = () => {
  const styles = useThemedStyles(_styles);
  const scrollViewRef = useRef();

  const onContentSizeChange = useCallback(() => {
    scrollViewRef.current.scrollToEnd({animated: true});
  }, [scrollViewRef]);

  return (
    <ScrollView
      horizontal={true}
      contentContainerStyle={styles.breadCrumbsList}
      ref={scrollViewRef}
      initialNumToRender={3}
      onContentSizeChange={onContentSizeChange}>
      <BreadCrumbsItems />
    </ScrollView>
  );
};
const BreadCrumbs = () => {
  const styles = useThemedStyles(_styles);

  return (
    <View style={styles.container}>
      <View style={styles.entitySelectorButton}>
        <EntitySelectorToggler />
      </View>

      <BreadCrumbsList />
      <View style={styles.entitySelectorButton}>
        <CloseForm />
      </View>
    </View>
  );
};

export default BreadCrumbs;
