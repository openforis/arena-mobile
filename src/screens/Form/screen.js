import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View, BackHandler} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Layout from 'arena-mobile-ui/components/Layout';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {alert} from 'arena-mobile-ui/utils';
import AttributeForm from 'form/common/Form';
import {ROUTES} from 'navigation/constants';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {useCloseNode} from 'state/form/hooks/useNodeFormActions';
import * as navigator from 'state/navigatorService';
import {selectors as surveySelectors} from 'state/survey';

import BreadCrumbs from './components/BreadCrumbs';
import EntityPage from './components/EntityPage';
import {getPrevNodeDef} from './components/EntityPage/components/common/EntityPanel/Navigation/component';
import EntitySelector from './components/EntitySelector';
import _styles from './styles';

const useAskBeforeLeave = () => {
  const survey = useSelector(surveySelectors.getSurvey);
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const currentEntityNodeDef = useSelector(
    formSelectors.getParentEntityNodeDef,
  );
  const nodeDefRoot = useSelector(surveySelectors.getNodeDefRoot);

  const nodeDefForm = useSelector(formSelectors.getNodeDef);

  const parentNodeDef = useSelector(state =>
    surveySelectors.getNodeDefByUuid(state, currentEntityNodeDef?.parentUuid),
  );

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const handleClose = useCloseNode();

  const onPressBack = useCallback(() => {
    if (currentEntityNodeDef.uuid === nodeDefRoot?.uuid) {
      navigation.canGoBack()
        ? navigation.goBack()
        : navigator.reset(ROUTES.HOME);
      return true;
    }

    if (nodeDefForm) {
      handleClose();
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
    return;
  }, [
    currentEntityNodeDef,
    nodeDefRoot,
    cycle,
    survey,
    parentNodeDef,
    dispatch,
    nodeDefForm,
    handleClose,
    navigation,
  ]);

  useEffect(() => {
    const beforeRemoveScreenAction = e => {
      e?.preventDefault();

      alert({
        title: t('Form:beforeLeave.title'),
        message: '',
        acceptText: t('Form:beforeLeave.acceptText'),
        dismissText: t('Form:beforeLeave.dismissText'),
        onDismiss: () => {},
        onAccept: () => {
          if (e?.data?.action) {
            navigation.dispatch(e.data.action);
          } else if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigator.reset(ROUTES.HOME);
          }
        },
      });
    };

    navigation.addListener('beforeRemove', beforeRemoveScreenAction);
    return () =>
      navigation.removeListener('beforeRemove', beforeRemoveScreenAction);
  }, [navigation, t]);

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
  const styles = useThemedStyles({styles: _styles});
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
