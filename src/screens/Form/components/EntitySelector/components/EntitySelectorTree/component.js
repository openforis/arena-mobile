import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import {selectors as surveySelectors} from 'state/survey';

import Entity from './components/Entity';
import styles from './styles';

const EntitySelectorTree = ({nodeDef, level = 0}) => {
  const children = useSelector(state =>
    surveySelectors.getNodeDefChildrenEntities(state, nodeDef),
  );
  const [showChildren, setShowChildren] = useState(true);
  const handleToggleVisibility = useCallback(
    () => setShowChildren(!showChildren),
    [showChildren],
  );
  const newLevel = useMemo(() => level + 1, [level]);
  return (
    <View style={{marginLeft: level * 16}}>
      <View style={styles.entityContainer}>
        <View style={styles.expandContainer}>
          {children.length > 0 && (
            <TouchableIcon
              iconName={
                showChildren
                  ? 'chevron-down-outline'
                  : 'chevron-forward-outline'
              }
              onPress={handleToggleVisibility}
              customStyle={{padding: 4}}
            />
          )}
        </View>
        <Entity key={`entity-${nodeDef.uuid}`} nodeDef={nodeDef} />
      </View>
      {showChildren &&
        (children || []).map(childEntity => (
          <EntitySelectorTree
            key={childEntity.uuid}
            nodeDef={childEntity}
            level={newLevel}
          />
        ))}
    </View>
  );
};

export default EntitySelectorTree;
