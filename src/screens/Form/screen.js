import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {Alert, View, BackHandler} from 'react-native';

import Layout from 'arena-mobile-ui/components/Layout';
import AttributeForm from 'form/common/Form';

import BreadCrumbs from './components/BreadCrumbs';
import EntityPage from './components/EntityPage';
import EntitySelector from './components/EntitySelector';
import styles from './styles';

/*
// root:
 - back -> ask
 - leave -> ask
// child
- back -> Navigate to prev
- leave -> ask
*/
const useAskBeforeLeave = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const beforeRemoveAction = e => {
      e.preventDefault();

      // Prompt the user before leaving the screen
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure to discard them and leave the screen?',
        [
          {text: "Don't leave", style: 'cancel', onPress: () => {}},
          {
            text: 'Discard',
            style: 'destructive',

            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    };

    navigation.addListener('beforeRemove', beforeRemoveAction);

    return () => navigation.removeListener('beforeRemove', beforeRemoveAction);
  }, [navigation]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to go back?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'YES', onPress: () => navigation.goBack()},
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler?.remove();
  }, [navigation]);
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
