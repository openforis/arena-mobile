import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useCallback} from 'react';
import {View, BackHandler} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Layout from 'arena-mobile-ui/components/Layout';
import {alert} from 'arena-mobile-ui/utils';
import AttributeForm from 'form/common/Form';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import BreadCrumbs from './components/BreadCrumbs';
import EntityPage from './components/EntityPage';
import {getPrevNodeDef} from './components/EntityPage/components/common/EntityNavigation/component';
import EntitySelector from './components/EntitySelector';
import styles from './styles';

const useAskBeforeLeave = () => {
  const survey = useSelector(surveySelectors.getSurvey);
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const currentEntityNodeDef = useSelector(
    formSelectors.getParentEntityNodeDef,
  );
  const nodeDefRoot = useSelector(surveySelectors.getNodeDefRoot);

  const parentNodeDef = useSelector(state =>
    surveySelectors.getNodeDefByUuid(state, currentEntityNodeDef?.parentUuid),
  );

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const beforeRemoveAction = useCallback(
    e => {
      e?.preventDefault();

      alert({
        title: 'Are you sure to leave the form?',
        message: '',
        acceptText: 'Stay',
        dismissText: 'Leave',
        onAccept: () => {},
        onDismiss: () =>
          e?.data?.action
            ? navigation.dispatch(e.data.action)
            : navigation.goBack(),
      });
    },
    [navigation],
  );
  const onPressBack = useCallback(() => {
    if (currentEntityNodeDef.uuid === nodeDefRoot.uuid) {
      navigation.goBack();
      return;
    }
    let prevNodeDef = false;
    if (!currentEntityNodeDef.props?.layout?.[cycle]?.pageUuid) {
      prevNodeDef = parentNodeDef;
    } else {
      prevNodeDef = getPrevNodeDef({
        survey,
        parent: parentNodeDef,
        cycle,
        currentEntityNodeDef,
      });
    }
    if (prevNodeDef) {
      dispatch(
        formActions.selectEntity({
          nodeDef: prevNodeDef,
        }),
      );
    }
    return true;
  }, [
    currentEntityNodeDef,
    nodeDefRoot,
    cycle,
    survey,
    parentNodeDef,
    dispatch,
    navigation,
  ]);

  useEffect(() => {
    navigation.addListener('beforeRemove', beforeRemoveAction);
    return () => navigation.removeListener('beforeRemove', beforeRemoveAction);
  }, [navigation, beforeRemoveAction]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onPressBack,
    );

    return () => backHandler?.remove();
  }, [onPressBack]);
};

const Form = () => {
  useAskBeforeLeave();
  return (
    <>
      <Layout bottomSafeArea={false}>
        <BreadCrumbs />

        <View style={[styles.container]}>
          <EntitySelector />
          <EntityPage />
        </View>
      </Layout>

      <AttributeForm />
    </>
  );
};

export default Form;
