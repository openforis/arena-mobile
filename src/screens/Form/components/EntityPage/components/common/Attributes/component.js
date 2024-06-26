import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import formPreferencesSelectors from 'state/form/selectors/preferences';

import ListForm from './ListForm';
import SingleNode from './SingleNode';
import _styles from './styles';

const AttributesContainer = () => {
  const styles = useThemedStyles(_styles);
  const isSingleNodeView = useSelector(
    formPreferencesSelectors.isSingleNodeView,
  );

  return (
    <View style={styles.container}>
      {isSingleNodeView ? <SingleNode /> : <ListForm />}
    </View>
  );
};
export default AttributesContainer;
