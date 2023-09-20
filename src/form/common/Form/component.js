import {NodeDefType} from '@openforis/arena-core';
import React, {useRef, useEffect, useMemo} from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
  View,
  StyleSheet,
} from 'react-native';
import {useSelector} from 'react-redux';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
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

import _styles from './styles';

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

const Spacer = () => <View style={_styles.spacer} />;

const RenderForm = ({nodeDef}) => {
  if (!nodeDef) {
    return null;
  }
  const Form = FormsByType[nodeDef?.type] || BaseForm;
  return <Form nodeDef={nodeDef} />;
};

export const RenderFormContainer = () => {
  const styles = useThemedStyles(_styles);
  const nodeDef = useSelector(formSelectors.getNodeDef);
  const scrollViewContainerStyles = useMemo(() => {
    return StyleSheet.compose(styles.scroll, styles.scrollContainer);
  }, [styles.scroll, styles.scrollContainer]);

  if (![NodeDefType.code, NodeDefType.taxon].includes(nodeDef?.type)) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled>
        <Spacer />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={scrollViewContainerStyles}>
          <RenderForm nodeDef={nodeDef} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <>
      <Spacer />

      <View style={styles.viewcontainer}>
        <RenderForm nodeDef={nodeDef} />
      </View>
    </>
  );
};

const AttributeFormWithModal = () => {
  const styles = useThemedStyles(_styles);
  const panelHeight = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const nodeDef = useSelector(formSelectors.getNodeDef);

  useEffect(() => {
    if (nodeDef) {
      const finalPanelHeight = HEIGHT * 0.9;
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
        <RenderFormContainer />
      </Animated.View>
    </>
  );
};

const AttributeForm = () => {
  const nodeDef = useSelector(formSelectors.getNodeDef);

  if ([NodeDefType.date, NodeDefType.time].includes(nodeDef?.type)) {
    return <RenderForm nodeDef={nodeDef} />;
  }

  return <AttributeFormWithModal />;
};

export default AttributeForm;
