import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import Entity from './components/Entity';
import HorizonalHelper from './components/HorizontalHelper';
import VerticalHelper from './components/VerticalHelper';
import styles from './styles';

const useChildrenIndex = nodeDefUuid => {
  const cycle = useSelector(surveySelectors.getSurveyCycle);

  const nodeDef = useSelector(state =>
    surveySelectors.getNodeDefByUuid(state, nodeDefUuid),
  );
  const childrenIndex = nodeDef?.props?.layout?.[cycle]?.indexChildren || [];

  // enable this if we like to show table in-form children into the index
  const tableChildrenIndex = []; /*useSelector(state =>
    surveySelectors.getNodeDefTableChildrenUuid(state, nodeDef),
  );*/

  return Array.from(new Set((childrenIndex || []).concat(tableChildrenIndex)));
};

const EntitySelectorTree = ({nodeDefUuid, level = 0}) => {
  const nodeDef = useSelector(state =>
    surveySelectors.getNodeDefByUuid(state, nodeDefUuid),
  );
  const childrenIndex = useChildrenIndex(nodeDefUuid);

  const [showChildren, setShowChildren] = useState(true);
  const handleToggleVisibility = useCallback(
    () => setShowChildren(!showChildren),
    [showChildren],
  );
  const newLevel = useMemo(() => level + 1, [level]);

  const currentEntityNodeDef = useSelector(
    formSelectors.getParentEntityNodeDef,
  );

  if (nodeDef) {
    return (
      <>
        <View style={[styles.container]}>
          <View style={styles.entityContainer}>
            {level > 0 && (
              <VerticalHelper childrenLength={childrenIndex?.length} />
            )}
            <View style={styles.expandContainer}>
              {childrenIndex?.length > 0 && (
                <TouchableIcon
                  iconName={showChildren ? 'chevron-down' : 'chevron-right'}
                  onPress={handleToggleVisibility}
                  customStyle={[styles.expandIcon]}
                />
              )}
            </View>
            <Entity
              key={`entity-${nodeDef.uuid}`}
              nodeDef={nodeDef}
              isCurrentEntity={currentEntityNodeDef?.uuid === nodeDefUuid}
            />
          </View>
        </View>
        {showChildren && childrenIndex.length > 0 && (
          <View style={styles.childrenContainer}>
            <HorizonalHelper level={level} />

            <View style={styles.children}>
              {showChildren &&
                childrenIndex?.map(childEntityUuid => (
                  <EntitySelectorTree
                    key={childEntityUuid}
                    nodeDefUuid={childEntityUuid}
                    level={newLevel}
                  />
                ))}
            </View>
          </View>
        )}
      </>
    );
  }
  return <></>;
};

export default EntitySelectorTree;
