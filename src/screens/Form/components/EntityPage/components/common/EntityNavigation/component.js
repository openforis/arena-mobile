import {Objects} from '@openforis/arena-core';
import React, {useCallback} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {isTablet} from 'react-native-device-info';
import {useDispatch, useSelector} from 'react-redux';

import {defaultCycle} from 'arena/config';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import EntitySelectorToggler from 'screens/Form/components/BreadCrumbs/components/EntitySelectorToggler';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';
const getNodeDefIndex = ({survey, nodeDef, cycle = defaultCycle}) => {
  return (
    nodeDef?.uuid &&
    survey.nodeDefs[nodeDef?.uuid].props.layout[cycle].indexChildren
  );
};

const NavigationButton = ({nodeDef, align = 'right'}) => {
  const dispatch = useDispatch();
  const nodeDefName = useNodeDefNameOrLabel({nodeDef});
  const handleSelect = useCallback(() => {
    dispatch(
      formActions.selectEntity({
        nodeDef,
      }),
    );
  }, [nodeDef, dispatch]);
  return (
    <TouchableOpacity onPress={handleSelect} hitSlop={{top: 10, bottom: 10}}>
      <Text
        style={[styles.text, align === 'left' ? styles.textLeft : {}]}
        ellipsizeMode="middle"
        numberOfLines={2}>
        {nodeDefName}
      </Text>
    </TouchableOpacity>
  );
};

export const getPrevNodeDef = ({
  survey,
  parent,
  cycle,
  currentEntityNodeDef,
}) => {
  const sibilings = getNodeDefIndex({survey, nodeDef: parent, cycle});
  const currentIndex = sibilings?.indexOf(currentEntityNodeDef.uuid);

  if (currentIndex === 0) {
    return survey.nodeDefs[parent.uuid];
  }
  if (currentIndex + 1 <= sibilings.length) {
    return survey.nodeDefs[sibilings[currentIndex - 1]];
  }
  return false;
};

const Prev = ({parent}) => {
  const survey = useSelector(surveySelectors.getSurvey);
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const currentEntityNodeDef = useSelector(
    formSelectors.getParentEntityNodeDef,
  );

  if (Objects.isEmpty(parent) || parent === false) {
    return <View />;
  }

  const prevNodeDef = getPrevNodeDef({
    survey,
    parent,
    cycle,
    currentEntityNodeDef,
  });

  if (prevNodeDef?.uuid) {
    return <NavigationButton nodeDef={prevNodeDef} align="left" />;
  }

  return <View />;
};

const Parent = ({parent}) => {
  return <NavigationButton nodeDef={parent} align="left" />;
};

const Next = ({parent}) => {
  const survey = useSelector(surveySelectors.getSurvey);
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const currentEntityNodeDef = useSelector(
    formSelectors.getParentEntityNodeDef,
  );
  const childrenIndex = getNodeDefIndex({
    survey,
    nodeDef: currentEntityNodeDef,
    cycle,
  });

  if (
    !Objects.isEmpty(childrenIndex) &&
    (Objects.isEmpty(parent) || parent === false || childrenIndex?.length > 0)
  ) {
    return <NavigationButton nodeDef={survey.nodeDefs[childrenIndex[0]]} />;
  }

  const sibilings = getNodeDefIndex({survey, nodeDef: parent, cycle});

  if (Objects.isEmpty(sibilings)) {
    return <View />;
  }

  const currentIndex = sibilings.indexOf(currentEntityNodeDef.uuid);

  if (currentIndex + 1 === sibilings.length && sibilings?.length > 0) {
    // next parent sibling
    const parentAncestor = survey.nodeDefs[parent.parentUuid];
    const parentSiblings = getNodeDefIndex({
      survey,
      nodeDef: parentAncestor,
      cycle,
    });

    const parentIndex = parentSiblings?.indexOf(parent.uuid);
    if (parentIndex >= 0 && parentIndex + 1 < parentSiblings?.length) {
      return (
        <NavigationButton
          nodeDef={survey.nodeDefs[parentSiblings?.[parentIndex + 1]]}
        />
      );
    }

    return <View />;
  }

  if (currentIndex < sibilings.length) {
    return (
      <NavigationButton
        nodeDef={survey.nodeDefs[sibilings[currentIndex + 1]]}
      />
    );
  }

  return <View />;
};

// next -> first children, next entity if single
// prev -> prev entity if single or parent
const EntityNavigation = () => {
  const isEntitySelectorOpened = useSelector(
    formSelectors.isEntitySelectorOpened,
  );
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const currentEntityNodeDef = useSelector(
    formSelectors.getParentEntityNodeDef,
  );
  const parentNodeDef = useSelector(state =>
    surveySelectors.getNodeDefByUuid(state, currentEntityNodeDef?.parentUuid),
  );

  const label = useNodeDefNameOrLabel({nodeDef: currentEntityNodeDef});

  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const keys = useSelector(state =>
    surveySelectors.getEntityNodeKeysAsString(state, parentEntityNode),
  );

  return (
    <View
      style={[
        styles.container,
        isTablet() && isEntitySelectorOpened
          ? styles.containerTabletMenuOpen
          : {},
      ]}>
      <View style={styles.header}>
        <EntitySelectorToggler customStyle={[styles.navigationBottom]} />
        <View>
          <Text style={[styles.headerTextInfo]}>Current page:</Text>
          <Text style={[styles.headerText]}>
            {label} [{keys}]
          </Text>
        </View>
      </View>
      <View style={styles.optionsContainer}>
        {!currentEntityNodeDef.props?.layout?.[cycle]?.pageUuid ? (
          <View style={styles.buttonsContainerCenter}>
            <Parent parent={parentNodeDef} />
          </View>
        ) : (
          <View style={styles.buttonsContainer}>
            <Prev parent={parentNodeDef} />
            <Next parent={parentNodeDef} />
          </View>
        )}
      </View>
    </View>
  );
};

export default EntityNavigation;
