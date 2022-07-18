import {Objects} from '@openforis/arena-core';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text} from 'react-native';
import {Tooltip} from 'react-native-elements';
import {useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import Icon from 'arena-mobile-ui/components/Icon';
import {selectors as formSelectors} from 'state/form';

const flatValidationObject = validation => {
  let errors = validation?.errors || [];
  let warnings = validation?.warnings || [];

  Object.keys(validation?.fields || {}).forEach(fieldKey => {
    const {warnings: _warnings, errors: _errors} = flatValidationObject(
      validation?.fields[fieldKey],
    );
    errors = errors.concat(_errors || []);
    warnings = warnings.concat(_warnings || []);
  });

  return {
    valid: validation?.valid,
    warnings,
    errors,
  };
};

const Validation = ({nodes, showValidation = true}) => {
  const {t} = useTranslation();
  const validation = useSelector(state =>
    formSelectors.getValidationByNodes(state, nodes),
  );

  const flatValidation = useMemo(
    () => flatValidationObject(validation),
    [validation],
  );

  const configBySeverity = useMemo(() => {
    if (flatValidation.errors.length > 0) {
      return {color: colors.error};
    }
    if (flatValidation.warnings.length > 0) {
      return {color: colors.alert};
    }
    return {color: colors.transparent};
  }, [flatValidation]);

  if (Objects.isEmpty(validation) || validation.valid || !showValidation) {
    return <></>;
  }

  return (
    <View>
      <Tooltip
        height={50}
        width={200}
        backgroundColor={configBySeverity.color}
        overlayColor={colors.transparent}
        animationType="none"
        popover={
          <>
            {flatValidation.errors.map(error => (
              <Text key={error.key}> {t(`Validation:${error.key}`)}</Text>
            ))}
            {flatValidation.warnings.map(warning => (
              <Text key={warning.key}> {t(`Validation:${warning.key}`)}</Text>
            ))}
          </>
        }>
        <View hitSlop={{left: 30, top: 10, right: 30, bottom: 10}}>
          <Icon name="alert-outline" color={configBySeverity.color} />
        </View>
      </Tooltip>
    </View>
  );
};

export default Validation;
