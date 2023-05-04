import {NodeDefType} from '@openforis/arena-core';
import React from 'react';
import {ScrollView, View, SafeAreaView} from 'react-native';
import Modal from 'react-native-modal';
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

const Spacer = () => <View style={{height: 80}} />;

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

const AttributeFormWithModal = () => {
  const styles = useThemedStyles({styles: _styles});
  const nodeDef = useSelector(formSelectors.getNodeDef);

  if (![NodeDefType.code, NodeDefType.taxon].includes(nodeDef?.type)) {
    return (
      <Modal
        isVisible={!!nodeDef}
        style={{justifyContent: 'flex-end', margin: 0}}
        avoidKeyboard={true}>
        <SafeAreaView
          style={{
            flexDirection: 'column',
            flex: 1,
          }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={[styles.scroll, styles.scrollContainer]}>
            {nodeDef &&
              React.createElement(FormsByType[nodeDef?.type] || BaseForm, {
                nodeDef,
              })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }
  return (
    <Modal
      isVisible={!!nodeDef}
      style={{justifyContent: 'flex-end', margin: 0}}
      avoidKeyboard={true}>
      <SafeAreaView
        style={{
          flexDirection: 'column',
          flex: 1,
        }}>
        <Spacer />

        <View style={[styles.viewcontainer]}>
          {nodeDef &&
            React.createElement(FormsByType[nodeDef?.type] || BaseForm, {
              nodeDef,
            })}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const AttributeForm = () => {
  const nodeDef = useSelector(formSelectors.getNodeDef);

  if (
    [NodeDefType.date, NodeDefType.time, NodeDefType.boolean].includes(
      nodeDef?.type,
    )
  ) {
    return (
      <>
        {nodeDef &&
          React.createElement(FormsByType[nodeDef?.type] || BaseForm, {
            nodeDef,
          })}
      </>
    );
  }

  return <AttributeFormWithModal />;
};

export default AttributeForm;
