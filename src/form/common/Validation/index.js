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
const basehitSlop = {left: 30, top: 10, right: 30, bottom: 10};

const Popover = ({message}) => {
  return <TextBase>{message}</TextBase>;
};

const validationMessageToString = ({validation, type, t, language}) => {
  return validation[type]
    .map(item => item?.messages?.[language] || t(`Validation:${item.key}`))
    .join('\n');
};

const Validation = React.memo(
  ({validation}) => {
    const {t} = useTranslation();

    const language = useSelector(surveySelector.getSelectedSurveyLanguage);

    const configBySeverityColor = useMemo(() => {
      if (validation.errors.length > 0) {
        return colors.error;
      }
      if (validation.warnings.length > 0) {
        return colors.alert;
      }
      return colors.transparent;
    }, [validation]);

    const errorMessages = useMemo(
      () =>
        validationMessageToString({validation, type: 'errors', t, language}),
      [validation, t, language],
    );

    const warningMessages = useMemo(
      () =>
        validationMessageToString({validation, type: 'warnings', t, language}),
      [validation, language, t],
    );

    const alertIcon = useMemo(() => {
      return (
        <View hitSlop={basehitSlop}>
          <Icon name="alert-outline" color={configBySeverityColor} />
        </View>
      );
    }, [configBySeverityColor]);

    const popover = useMemo(() => {
      return <Popover message={`${errorMessages} ${warningMessages}`} />;
    }, [errorMessages, warningMessages]);

    if (Objects.isEmpty(validation) || validation.valid) {
      return <></>;
    }

    return (
      <Tooltip
        height={null}
        width={200}
        backgroundColor={configBySeverityColor}
        overlayColor={colors.transparent}
        animationType="none"
        skipAndroidStatusBar={true}
        popover={popover}>
        {alertIcon}
      </Tooltip>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.validation.valid === nextProps.validation.valid;
  },
);

const ValidationWrapper = ({nodes, showValidation, absolute}) => {
  const validation = useSelector(state =>
    formSelectors.getValidationByNodes(state, nodes),
  );
  const wrapperStyle = useMemo(
    () => (absolute ? styles.absolute : styles.relative),
    [absolute],
  );

  const flatValidation = useMemo(
    () => flatValidationObject(validation),
    [validation],
  );

  if (Objects.isEmpty(validation) || validation.valid || !showValidation) {
    return <></>;
  }

  return (
    <View style={wrapperStyle}>
      <Validation validation={flatValidation} />
    </View>
  );
};

ValidationWrapper.defaultProps = {
  showValidation: true,
  absolute: false,
};

export default React.memo(ValidationWrapper, (prevProps, nextProps) => {
  return prevProps.nodes.every(node => {
    return nextProps.nodes.some(_node => _node.uuid === node.uuid);
  });
});
