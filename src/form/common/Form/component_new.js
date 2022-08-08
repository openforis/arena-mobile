import {NodeDefType} from '@openforis/arena-core';
import React from 'react';
import {ScrollView, SafeAreaView} from 'react-native';
import Modal from 'react-native-modal';
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
  const nodeDef = useSelector(formSelectors.getNodeDef);

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
          style={[styles.formContainerV2, {marginTop: 30}]}>
          {nodeDef &&
            React.createElement(FormsByType[nodeDef?.type] || BaseForm, {
              nodeDef,
            })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const AttributeForm = () => {
  const nodeDef = useSelector(formSelectors.getNodeDef);

  if (
    [
      NodeDefType.date,
      NodeDefType.time,
      NodeDefType.boolean,
      NodeDefType.code,
    ].includes(nodeDef?.type)
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
