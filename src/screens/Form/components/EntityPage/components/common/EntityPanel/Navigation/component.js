import {Objects} from '@openforis/arena-core';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {defaultCycle} from 'arena/config';
import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';

const getNodeDefIndex = ({survey, nodeDef, cycle = defaultCycle}) => {
  return (
    nodeDef?.uuid &&
    survey.nodeDefs[nodeDef?.uuid].props.layout[cycle].indexChildren
  );
};

const ChevronLeft = <Icon name="chevron-left" />;
const ChevronRight = <Icon name="chevron-right" />;

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
    <Button
      onPress={handleSelect}
      style={styles.button}
      hitSlop={{top: 10, bottom: 10}}
      allowMultipleLines={true}
      label={nodeDefName}
      type="neutral"
      customTextStyle={[styles.text, align === 'left' ? styles.textLeft : {}]}
      icon={align === 'left' ? ChevronLeft : ChevronRight}
      iconPosition={align === 'left' ? 'left' : 'right'}
      bold={false}
    />
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
const Navigation = () => {
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const currentEntityNodeDef = useSelector(
    formSelectors.getParentEntityNodeDef,
  );
  const parentNodeDef = useSelector(state =>
    surveySelectors.getNodeDefByUuid(state, currentEntityNodeDef?.parentUuid),
  );

  return (
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
  );
};

export default Navigation;