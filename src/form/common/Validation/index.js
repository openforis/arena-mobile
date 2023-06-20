import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {Tooltip} from 'react-native-elements';
import {useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import Icon from 'arena-mobile-ui/components/Icon';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import {Objects} from 'infra/objectUtils';
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

const Validation = ({validation, absolute = false}) => {
  const {t} = useTranslation();

  const flatValidation = useMemo(
    () => flatValidationObject(validation),
    [validation],
  );

  const language = useSelector(surveySelector.getSelectedSurveyLanguage);

  const configBySeverityColor = useMemo(() => {
    if (flatValidation.errors.length > 0) {
      return colors.error;
    }
    if (flatValidation.warnings.length > 0) {
      return colors.alert;
    }
    return colors.transparent;
  }, [flatValidation]);

  const errorMessages = useMemo(
    () =>
      flatValidation?.errors
        ?.map(
          error => error?.messages?.[language] || t(`Validation:${error.key}`),
        )
        .join('\n'),
    [flatValidation, t, language],
  );

  const warningMessages = useMemo(
    () =>
      flatValidation?.warnings
        ?.map(
          warning =>
            warning?.messages?.[language] || t(`Validation:${warning.key}`),
        )
        .join('\n'),
    [flatValidation, language, t],
  );

  if (Objects.isEmpty(validation) || validation.valid) {
    return <></>;
  }

  return (
    <View style={[absolute ? styles.absolute : {}]}>
      <Tooltip
        height={null}
        width={200}
        backgroundColor={configBySeverityColor}
        overlayColor={colors.transparent}
        animationType="none"
        skipAndroidStatusBar={true}
        popover={
          <TextBase>
            {errorMessages} {warningMessages}
          </TextBase>
        }>
        <View hitSlop={{left: 30, top: 10, right: 30, bottom: 10}}>
          <Icon name="alert-outline" color={configBySeverityColor} />
        </View>
      </Tooltip>
    </View>
  );
};

const ValidationWrapper = ({
  nodes,
  showValidation = true,
  absolute = false,
}) => {
  const validation = useSelector(state =>
    formSelectors.getValidationByNodes(state, nodes),
  );

  if (Objects.isEmpty(validation) || validation.valid || !showValidation) {
    return <></>;
  }

  return <Validation validation={validation} absolute={absolute} />;
};

export default ValidationWrapper;
