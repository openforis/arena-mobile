import {NodeDefType} from '@openforis/arena-core';
import React, {useRef, useEffect} from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';

import BooleanForm from 'form/Attributes/Boolean/Form';
import CodeForm from 'form/Attributes/Code/Form';
import BaseForm from 'form/Attributes/common/Base/Form';
import CoordinateForm from 'form/Attributes/Coordinate/Form';
import DateForm from 'form/Attributes/Date/Form';
import DecimalForm from 'form/Attributes/Decimal/Form';
import FileForm from 'form/Attributes/File/Form';
import IntegerForm from 'form/Attributes/Integer/Form';
import TaxonForm from 'form/Attributes/Taxonomy/Form';
import TextForm from 'form/Attributes/Text/Form';
import TimeForm from 'form/Attributes/Time/Form';
import formSelectors from 'state/form/selectors';

import styles from './styles';

const {height: HEIGHT} = Dimensions.get('screen');

const FormsByType = {
  [NodeDefType.integer]: IntegerForm,
  [NodeDefType.decimal]: DecimalForm,
  [NodeDefType.text]: TextForm,
  [NodeDefType.code]: CodeForm,
  [NodeDefType.coordinate]: CoordinateForm,
  [NodeDefType.boolean]: BooleanForm,
  [NodeDefType.date]: DateForm,
  [NodeDefType.time]: TimeForm,
  [NodeDefType.file]: FileForm,
  [NodeDefType.taxon]: TaxonForm,
};

const Spacer = () => <View style={styles.spacer} />;

const RenderForm = ({nodeDef}) => {
  if (!nodeDef) {
    return null;
  }
  const Form = FormsByType[nodeDef?.type] || BaseForm;
  return <Form nodeDef={nodeDef} />;
};

const AttributeFormWithModal = () => {
  const panelHeight = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const nodeDef = useSelector(formSelectors.getNodeDef);

  useEffect(() => {
    if (nodeDef) {
      const finalPanelHeight = HEIGHT;
      Animated.sequence([
        Animated.delay(50),
        Animated.timing(panelHeight, {
          toValue: finalPanelHeight,
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
        {![NodeDefType.code, NodeDefType.taxon].includes(nodeDef?.type) ? (
          <KeyboardAvoidingView
            style={[styles.container]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            enabled>
            <Spacer />
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={[styles.scroll]}>
              <RenderForm nodeDef={nodeDef} />
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <>
            <Spacer />

            <View style={[styles.viewcontainer]}>
              <RenderForm nodeDef={nodeDef} />
            </View>
          </>
        )}
      </Animated.View>
    </>
  );
};

const AttributeForm = () => {
  const nodeDef = useSelector(formSelectors.getNodeDef);

  if (
    [NodeDefType.date, NodeDefType.time, NodeDefType.boolean].includes(
      nodeDef?.type,
    )
  ) {
    return <RenderForm nodeDef={nodeDef} />;
  }

  return <AttributeFormWithModal />;
};

export default AttributeForm;
