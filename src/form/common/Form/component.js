import {NodeDefType} from '@openforis/arena-core';
import React, {useRef, useEffect} from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {useSelector} from 'react-redux';

import CodeForm from 'form/Attributes/Code/Form';
import BaseForm from 'form/Attributes/common/Base/Form';
import DecimalForm from 'form/Attributes/Decimal/Form';
import IntegerForm from 'form/Attributes/Integer/Form';
import TextForm from 'form/Attributes/Text/Form';
import formSelectors from 'state/form/selectors';

import styles from './styles';

const {height: HEIGHT} = Dimensions.get('screen');

const FormsByType = {
  [NodeDefType.integer]: IntegerForm,
  [NodeDefType.decimal]: DecimalForm,
  [NodeDefType.text]: TextForm,
  [NodeDefType.code]: CodeForm,
};

const AttributeForm = () => {
  const panelHeight = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const nodeDef = useSelector(formSelectors.getNodeDef);

  useEffect(() => {
    if (nodeDef) {
      const finalPanerWidth = HEIGHT;
      Animated.sequence([
        Animated.delay(50),
        Animated.timing(panelHeight, {
          toValue: finalPanerWidth,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.timing(panelHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [nodeDef]);

  useEffect(() => {
    if (nodeDef) {
      const finalOpacity = 1;
      Animated.sequence([
        Animated.delay(50),
        Animated.timing(backgroundOpacity, {
          toValue: finalOpacity,
          duration: 100,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [nodeDef]);

  return (
    <>
      {nodeDef && (
        <Animated.View
          style={[
            styles.shadowContainer,
            {
              opacity: backgroundOpacity,
            },
          ]}
        />
      )}
      <Animated.View style={[styles.formContainer, {height: panelHeight}]}>
        <KeyboardAvoidingView
          style={[styles.container]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          enabled>
          <TouchableOpacity style={{height: 80}} />
          <ScrollView
            keyboardShouldPersistTaps="always"
            style={{
              borderRadius: 16,
              padding: 16,
              backgroundColor: 'white',
            }}>
            {nodeDef &&
              React.createElement(FormsByType[nodeDef?.type] || BaseForm, {
                nodeDef,
              })}
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
};

export default AttributeForm;
