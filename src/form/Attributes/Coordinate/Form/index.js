import {PointFactory, Points} from '@openforis/arena-core';
import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, View} from 'react-native';
import {useSelector} from 'react-redux';

import Input, {InputContainer} from 'arena-mobile-ui/components/Input';
import Select from 'arena-mobile-ui/components/Select';
import BaseForm from 'form/Attributes/common/Base/Form';
import {useUpdateNode} from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';
import surveySelectors from 'state/survey/selectors';

import GetLocation, {toFixedIfLongerAndNumber} from './GetLocation';
import styles from './styles';

const BASE_VALUE = {x: null, y: null, srs: null};

const DEFAULT_SRS_CODE = '4326';

const Form = ({nodeDef}) => {
  const {t} = useTranslation();

  const [newValue, setValue] = useState(BASE_VALUE);
  const node = useSelector(formSelectors.getNode);

  const handleUpdateNode = useUpdateNode();
  const surveySrs = useSelector(surveySelectors.getSurveySRS);

  const selectedSrs = useMemo(() => {
    const srsCode = newValue.srs || node?.value?.srs;

    return (
      surveySrs.find(srs => String(srs.code) === String(srsCode)) ||
      surveySrs[0]
    );
  }, [surveySrs, node, newValue]);

  const handleSubmit = useCallback(
    ({callback = () => null} = {}) => {
      const _value = Object.assign({}, newValue, {
        srs: newValue.srs || selectedSrs,
      });
      const pointAsArenaCoreWants = PointFactory.createInstance(_value);
      handleUpdateNode({node, value: pointAsArenaCoreWants, callback});
    },
    [node, newValue, handleUpdateNode, selectedSrs],
  );

  const handleUpdateValue = useCallback(
    field => valueUpdated => {
      setValue(prevValue => {
        const _value = String((valueUpdated || '').replace(',', '.'));

        return Object.assign({}, prevValue, {
          [field]:
            DEFAULT_SRS_CODE === selectedSrs.code && _value !== ''
              ? toFixedIfLongerAndNumber(_value, 6)
              : _value,
        });
      });
    },
    [selectedSrs],
  );

  const handleSelect = useCallback(
    srs => {
      if (srs?.code) {
        setValue(prevValue =>
          Points.transform(PointFactory.createInstance(prevValue), srs?.code),
        );
      }
    },
    [setValue],
  );

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
      const point = PointFactory.createInstance({
        srs: DEFAULT_SRS_CODE,
        x: Number(location.coords.longitude),
        y: Number(location.coords.latitude),
      });

      const transformedPoint = Points.transform(point, selectedSrs.code);

      setValue(transformedPoint);
    },
    [setValue, selectedSrs],
  );

  const _keyStractor = useCallback(item => item.code, []);
  const _labelStractor = useCallback(item => item.name, []);

  return (
    <BaseForm nodeDef={nodeDef} handleSubmit={handleSubmit} nodes={[node]}>
      <GetLocation
        handleSaveLocation={handleSaveLocation}
        selectedSrs={selectedSrs}
      />

      <Input
        horizontal={true}
        stacked={true}
        title={t('Form:nodeDefCoordinate.x')}
        onChangeText={handleUpdateValue('x')}
        defaultValue={String(newValue.x || node?.value?.x || '')}
        keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
        textAlign="right"
        editable={
          nodeDef.props.allowOnlyDeviceCoordinate === true ? false : true
        }
      />

      <Input
        horizontal={true}
        stacked={true}
        title={t('Form:nodeDefCoordinate.y')}
        onChangeText={handleUpdateValue('y')}
        defaultValue={String(newValue.y || node?.value?.y || '')}
        keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
        textAlign="right"
        editable={
          nodeDef.props.allowOnlyDeviceCoordinate === true ? false : true
        }
      />
      <InputContainer
        horizontal={true}
        stacked={true}
        title={t('Form:nodeDefCoordinate.srs')}
        hasTitle={true}>
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
