import {Objects} from '@openforis/arena-core';
import React, {useCallback} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';

const getNodeDefIndex = ({survey, nodeDef, cycle = '0'}) => {
  return survey.nodeDefs[nodeDef.uuid].props.layout[cycle].indexChildren;
};

const Button = ({nodeDef}) => {
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
      <Text style={[styles.text]}>{nodeDefName}</Text>
    </TouchableOpacity>
  );
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

  const sibilings = getNodeDefIndex({survey, nodeDef: parent, cycle});
  const currentIndex = sibilings.indexOf(currentEntityNodeDef.uuid);

  if (currentIndex === 0) {
    return <Button nodeDef={survey.nodeDefs[parent.uuid]} />;
  }

  if (currentIndex + 1 <= sibilings.length) {
    return <Button nodeDef={survey.nodeDefs[sibilings[currentIndex - 1]]} />;
  }

  return <View />;
};

const Parent = ({parent}) => {
  return <Button nodeDef={parent} />;
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
    Objects.isEmpty(parent) ||
    parent === false ||
    childrenIndex?.length > 0
  ) {
    return <Button nodeDef={survey.nodeDefs[childrenIndex[0]]} />;
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

    const parentIndex = parentSiblings.indexOf(parent.uuid);
    if (parentIndex >= 0 && parentIndex + 1 < parentSiblings.length) {
      return (
        <Button nodeDef={survey.nodeDefs[parentSiblings[parentIndex + 1]]} />
      );
    }

    return <View />;
  }

  if (currentIndex < sibilings.length) {
    return <Button nodeDef={survey.nodeDefs[sibilings[currentIndex + 1]]} />;
  }

  return <View />;
};

// next -> first children, next entity if single
// prev -> prev entity if single or parent
const EntityNavigation = () => {
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const currentEntityNodeDef = useSelector(
    formSelectors.getParentEntityNodeDef,
  );
  const parentNodeDef = useSelector(state =>
    surveySelectors.getNodeDefByUuid(state, currentEntityNodeDef?.parentUuid),
  );

  if (!currentEntityNodeDef.props?.layout?.[cycle]?.pageUuid) {
    return (
      <View style={styles.container}>
        <View style={styles.buttonsContainerCenter}>
          <Parent parent={parentNodeDef} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <Prev parent={parentNodeDef} />
        <Next parent={parentNodeDef} />
      </View>
    </View>
  );
};

export default EntityNavigation;
