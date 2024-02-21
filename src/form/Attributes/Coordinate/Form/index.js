import {PointFactory, Points} from '@openforis/arena-core';
import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, View} from 'react-native';
import {useSelector} from 'react-redux';

import Input, {InputContainer} from 'arena-mobile-ui/components/Input';
import Select from 'arena-mobile-ui/components/Select';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import BaseForm from 'form/Attributes/common/Base/Form';
import {useUpdateNode} from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';
import surveySelectors from 'state/survey/selectors';

import GetLocation, {toFixedIfLongerAndNumber} from './GetLocation';
import styles from './styles';

const BASE_VALUE = {x: null, y: null, srs: null};

const DEFAULT_SRS_CODE = '4326';

const CoordinateInput = ({
  allowOnlyDeviceCoordinate,
  defaultValue,
  coordinateKey,
  handleUpdateValue,
}) => {
  const {t} = useTranslation();
  return (
    <Input
      horizontal={true}
      stacked={true}
      title={t(`Form:nodeDefCoordinate.${coordinateKey}`)}
      onChangeText={handleUpdateValue(coordinateKey)}
      defaultValue={defaultValue}
      keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
      textAlign="right"
      editable={!allowOnlyDeviceCoordinate}
    />
  );
};

const Form = ({nodeDef}) => {
  const {t} = useTranslation();

  const [newValue, setValue] = useState(BASE_VALUE);
  const node = useSelector(formSelectors.getNode);

  const handleUpdateNode = useUpdateNode();
  const surveySrs = useSelector(surveySelectors.getSurveySRS);
  const surveySrsIndex = useSelector(surveySelectors.getSurveySRSIndex);

  const selectedSrs = useMemo(() => {
    const srsCode = newValue?.srs || node?.value?.srs;

    return (
      surveySrsIndex[srsCode] ||
      surveySrsIndex[DEFAULT_SRS_CODE] ||
      Object.values(surveySrsIndex)[0]
    );
  }, [surveySrsIndex, node, newValue]);

  const handleSubmit = useCallback(
    ({callback = () => null} = {}) => {
      const _value = {...newValue, srs: newValue?.srs || selectedSrs};
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
          Points.transform(prevValue, srs?.code, surveySrsIndex),
        );
      }
    },
    [setValue, surveySrsIndex],
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
        accuracy: Number(location.coords.accuracy).toFixed(3),
        altitude: Number(location.coords.altitude).toFixed(2),
        altitudeAccuracy: Number(location.coords.altitudeAccuracy).toFixed(3),
      });

      const transformedPoint = Points.transform(
        point,
        selectedSrs.code,
        surveySrsIndex,
      );

      if (transformedPoint.x === null || transformedPoint.y === null) {
        return;
      }
      setValue(transformedPoint);
    },
    [setValue, selectedSrs, surveySrsIndex],
  );

  const _keyExtractor = useCallback(item => item.code, []);
  const _labelExtractor = useCallback(item => item.name, []);

  const nodes = useMemo(() => [node], [node]);

  return (
    <BaseForm nodeDef={nodeDef} handleSubmit={handleSubmit} nodes={nodes}>
      <GetLocation
        handleSaveLocation={handleSaveLocation}
        selectedSrs={selectedSrs}
        surveySrsIndex={surveySrsIndex}
      />
      <CoordinateInput
        coordinateKey="x"
        handleUpdateValue={handleUpdateValue}
        defaultValue={String(newValue?.x || node?.value?.x || '')}
        allowOnlyDeviceCoordinate={nodeDef?.props?.allowOnlyDeviceCoordinate}
      />

      <CoordinateInput
        coordinateKey="y"
        handleUpdateValue={handleUpdateValue}
        defaultValue={String(newValue?.y || node?.value?.y || '')}
        allowOnlyDeviceCoordinate={nodeDef?.props?.allowOnlyDeviceCoordinate}
      />

      {nodeDef?.props?.includeAccuracy && (
        <CoordinateInput
          coordinateKey="accuracy"
          handleUpdateValue={handleUpdateValue}
          defaultValue={String(
            newValue?.accuracy || node?.value?.accuracy || '',
          )}
          allowOnlyDeviceCoordinate={nodeDef?.props?.allowOnlyDeviceCoordinate}
        />
      )}

      {nodeDef?.props?.includeAltitude && (
        <CoordinateInput
          coordinateKey="altitude"
          handleUpdateValue={handleUpdateValue}
          defaultValue={String(
            newValue?.altitude || node?.value?.altitude || '',
          )}
          allowOnlyDeviceCoordinate={nodeDef?.props?.allowOnlyDeviceCoordinate}
        />
      )}

      {nodeDef?.props?.includeAltitudeAccuracy && (
        <CoordinateInput
          coordinateKey="altitudeAccuracy"
          handleUpdateValue={handleUpdateValue}
          defaultValue={String(
            newValue?.altitudeAccuracy || node?.value?.altitudeAccuracy || '',
          )}
          allowOnlyDeviceCoordinate={nodeDef?.props?.allowOnlyDeviceCoordinate}
        />
      )}

      <InputContainer
        horizontal={true}
        stacked={true}
        title={t('Form:nodeDefCoordinate.srs')}
        hasTitle={true}>
        <View style={styles.selectContainer}>
          {surveySrs.length > 1 ? (
            <Select
              items={surveySrs}
              keyExtractor={_keyExtractor}
              labelExtractor={_labelExtractor}
              onValueChange={handleSelect}
              selectedItemKey={
                newValue?.srs || node?.value?.srs || selectedSrs.code
              }
              disabled={surveySrs.length <= 1}
            />
          ) : (
            <TextBase>
              {selectedSrs.name} ({selectedSrs.code})
            </TextBase>
          )}
        </View>
      </InputContainer>
    </BaseForm>
  );
};

export default Form;
