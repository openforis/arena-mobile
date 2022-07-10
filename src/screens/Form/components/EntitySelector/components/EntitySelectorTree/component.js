import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import {selectors as surveySelectors} from 'state/survey';

import Entity from './components/Entity';
import HorizonalHelper from './components/HorizontalHelper';
import VerticalHelper from './components/VerticalHelper';
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
    <>
      <View style={[styles.container]}>
        <View style={styles.entityContainer}>
          {level > 0 && <VerticalHelper childrenLength={children.length} />}
          <View style={styles.expandContainer}>
            {children.length > 0 && (
              <TouchableIcon
                iconName={
                  showChildren
                    ? 'chevron-down-outline'
                    : 'chevron-forward-outline'
                }
                onPress={handleToggleVisibility}
                customStyle={[styles.expandIcon]}
              />
            )}
          </View>
          <Entity
            key={`entity-${nodeDef.uuid}`}
            nodeDef={nodeDef}
            level={level}
            hasChildren={children.length > 0}
          />
        </View>
      </View>
      {showChildren && children.length > 0 && (
        <View style={styles.childrenContainer}>
          <HorizonalHelper level={level} />

          <View style={styles.children}>
            {showChildren &&
              children.map(childEntity => (
                <EntitySelectorTree
                  key={childEntity.uuid}
                  nodeDef={childEntity}
                  level={newLevel}
                />
              ))}
          </View>
        </View>
      )}
    </>
  );
};

export default EntitySelectorTree;
