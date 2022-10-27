import {SRSs, PointFactory} from '@openforis/arena-core';
import React, {useState, useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, View} from 'react-native';
import {useSelector} from 'react-redux';

import Input, {InputContainer} from 'arena-mobile-ui/components/Input';
import Select from 'arena-mobile-ui/components/Select';
import BaseForm from 'form/Attributes/common/Base/Form';
import {useUpdateNode} from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';
import surveySelectors from 'state/survey/selectors';

import GetLocation from './GetLocation';
import styles from './styles';

const BASE_VALUE = {x: null, y: null, srs: null};

const Form = ({nodeDef}) => {
  const {t} = useTranslation();

  const [newValue, setValue] = useState(BASE_VALUE);
  const node = useSelector(formSelectors.getNode);

  const handleUpdateNode = useUpdateNode();
  const surveySrs = useSelector(surveySelectors.getSurveySRS);

  const selectedSrs =
    surveySrs.find(srs => srs.code === node?.value?.srs) || surveySrs[0];

  const handleSubmit = useCallback(
    ({callback = () => null} = {}) => {
      const pointAsArenaCoreWants = PointFactory.createInstance(newValue);
      handleUpdateNode({node, value: pointAsArenaCoreWants, callback});
    },
    [node, newValue, handleUpdateNode],
  );

  const handleUpdateValue = useCallback(
    field => valueUpdated => {
      setValue(prevValue =>
        Object.assign({}, prevValue, {
          [field]: Number((valueUpdated || '').replace(',', '.')),
        }),
      );
    },
    [],
  );

  const handleSelect = useCallback(
    srs => {
      if (srs?.code) {
        handleUpdateValue('srs')(srs.code);
      }
    },
    [handleUpdateValue],
  );

  useEffect(() => {
    (async () => {
      await SRSs.init();
    })();
  }, []);

  useEffect(() => {
    if (node.value) {
      setValue(Object.assign({}, node.value));
    }
  }, [node.value]);

  useEffect(() => {
    if (selectedSrs) {
      setValue(prevValue =>
        Object.assign({}, prevValue, {srs: selectedSrs.code}),
      );
    }
  }, [selectedSrs]);

  const handleSaveLocation = useCallback(
    location => {
      setValue(prevValue =>
        Object.assign({}, prevValue, {
          x: Number(location.coords.longitude),
          y: Number(location.coords.latitude),
        }),
      );
    },
    [setValue],
  );

  const _keyStractor = useCallback(item => item.code, []);
  const _labelStractor = useCallback(item => item.name, []);

  return (
    <BaseForm nodeDef={nodeDef} handleSubmit={handleSubmit}>
      <GetLocation handleSaveLocation={handleSaveLocation} />

      <Input
        horizontal={true}
        stacked={true}
        title={t('Form:nodeDefCoordinate.x')}
        onChangeText={handleUpdateValue('x')}
        defaultValue={String(newValue.x || node?.value?.x || '')}
        keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
        textAlign="right"
      />

      <Input
        horizontal={true}
        stacked={true}
        title={t('Form:nodeDefCoordinate.y')}
        onChangeText={handleUpdateValue('y')}
        defaultValue={String(newValue.y || node?.value?.y || '')}
        keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
        textAlign="right"
      />
      <InputContainer
        horizontal={true}
        stacked={true}
        title={t('Form:nodeDefCoordinate.srs')}>
        <View style={styles.selectContainer}>
          {surveySrs.length > 0 && (
            <Select
              items={surveySrs}
              keyStractor={_keyStractor}
              labelStractor={_labelStractor}
              onValueChange={handleSelect}
              selectedItemKey={
                newValue.srs || node?.value?.srs || selectedSrs.code
              }
              disabled={surveySrs.length <= 1}
            />
          )}
        </View>
      </InputContainer>
    </BaseForm>
  );
};

export default Form;
