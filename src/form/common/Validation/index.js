import {Objects} from '@openforis/arena-core';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {Tooltip} from 'react-native-elements';
import {useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import Icon from 'arena-mobile-ui/components/Icon';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelector} from 'state/survey';

import styles from './styles';

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

const Validation = ({nodes, showValidation = true, absolute = false}) => {
  const {t} = useTranslation();
  const validation = useSelector(state =>
    formSelectors.getValidationByNodes(state, nodes),
  );

  const flatValidation = useMemo(
    () => flatValidationObject(validation),
    [validation],
  );

  const language = useSelector(surveySelector.getSelectedSurveyLanguage);

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
    <View style={[absolute ? styles.absolute : {}]}>
      <Tooltip
        height={null}
        width={200}
        backgroundColor={configBySeverity.color}
        overlayColor={colors.transparent}
        animationType="none"
        skipAndroidStatusBar={true}
        popover={
          <>
            {flatValidation.errors.map(error => (
              <TextBase key={error.key}>
                {error?.messages?.[language] || t(`Validation:${error.key}`)}
              </TextBase>
            ))}
            {flatValidation.warnings.map(warning => (
              <TextBase key={warning.key}>
                {warning?.messages?.[language] ||
                  t(`Validation:${warning.key}`)}
              </TextBase>
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
