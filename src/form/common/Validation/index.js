import {RecordValidations} from '@openforis/arena-core';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet} from 'react-native';
import {Tooltip} from 'react-native-elements';
import {useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import Icon from 'arena-mobile-ui/components/Icon';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {Objects, compareArraysAsSets} from 'infra/objectUtils';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelector} from 'state/survey';
import {selectors as validationSelectors} from 'state/validation';

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

const Popover = ({message, colorText}) => {
  const configBySeverityColor = useMemo(() => {
    return StyleSheet.create({
      textStyle: {
        color: colorText,
      },
    });
  }, [colorText]);

  return <TextBase style={configBySeverityColor.textStyle}>{message}</TextBase>;
};

const validationMessageToString = ({
  validation,
  type,
  t,
  language,
  count,
  nodeDeflabel,
}) => {
  return validation[type]
    .map(item => {
      return (
        item?.messages?.[language] ||
        `${t(`Validation:${item.key}`, {
          nodeDefName: nodeDeflabel,
          count: count,
          maxCount: item?.params?.maxCount,
          minCount: item?.params?.minCount,
        })}`
      );
    })
    .join('\n');
};

const Validation = React.memo(
  ({validation, nodeDef, count}) => {
    const {t} = useTranslation();

    const language = useSelector(surveySelector.getSelectedSurveyLanguage);

    const nodeDeflabel = useNodeDefNameOrLabel({nodeDef});

    const configBySeverityColor = useMemo(() => {
      if (validation.errors.length > 0) {
        return {
          background: colors.error,
          text: colors.white,
        };
      }
      if (validation.warnings.length > 0) {
        return {
          background: colors.alert,
          text: colors.black,
        };
      }
      return {
        background: colors.transparent,
        text: colors.black,
      };
    }, [validation]);

    const errorMessages = useMemo(
      () =>
        validationMessageToString({
          validation,
          type: 'errors',
          t,
          language,
          nodeDef,
          count,
          nodeDeflabel,
        }),
      [validation, t, language, nodeDef, count, nodeDeflabel],
    );

    const warningMessages = useMemo(
      () =>
        validationMessageToString({
          validation,
          type: 'warnings',
          t,
          language,
          nodeDef,
          count,
          nodeDeflabel,
        }),
      [validation, language, nodeDef, count, nodeDeflabel, t],
    );

    const alertIcon = useMemo(() => {
      return (
        <View hitSlop={basehitSlop}>
          <Icon name="alert-outline" color={configBySeverityColor.background} />
        </View>
      );
    }, [configBySeverityColor]);

    const popover = useMemo(() => {
      return (
        <Popover
          message={`${errorMessages} ${warningMessages}`}
          colorText={configBySeverityColor.text}
        />
      );
    }, [errorMessages, warningMessages, configBySeverityColor]);

    if (Objects.isEmpty(validation) || validation.valid) {
      return <></>;
    }

    return (
      <Tooltip
        height={null}
        width={200}
        backgroundColor={configBySeverityColor.background}
        overlayColor={colors.transparent}
        animationType="none"
        skipAndroidStatusBar={true}
        popover={popover}>
        {alertIcon}
      </Tooltip>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.validation.valid === nextProps.validation.valid &&
      prevProps.validation.errors?.[0]?.key ===
        nextProps.validation.errors?.[0]?.key &&
      prevProps.nodeDef.uuid === nextProps.nodeDef.uuid
    );
  },
);

const useValidationCount = ({parentEntityNode, nodeDef}) => {
  const validation = useSelector(
    validationSelectors.getValidation,
    Objects.shallowEqual,
  );
  const validationCount = RecordValidations.getValidationChildrenCount({
    nodeParentUuid: parentEntityNode?.uuid,
    nodeDefChildUuid: nodeDef.uuid,
  })(validation);

  if (validationCount.valid) {
    return null;
  }
  return validationCount;
};
const ValidationWrapper = ({nodesUuids, showValidation, absolute, nodeDef}) => {
  const validation = useSelector(state =>
    validationSelectors.getValidationByNodes(state, nodesUuids),
  );
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);

  const validationCount = useValidationCount({
    parentEntityNode,
    nodeDef,
  });
  const wrapperStyle = useMemo(
    () => (absolute ? styles.absolute : styles.relative),
    [absolute],
  );

  const flatValidation = useMemo(
    () => flatValidationObject(validationCount || validation),
    [validation, validationCount],
  );

  if (
    Objects.isEmpty(flatValidation) ||
    flatValidation.valid ||
    !showValidation ||
    Objects.isEmpty(nodeDef)
  ) {
    return <></>;
  }

  return (
    <View style={wrapperStyle}>
      <Validation
        validation={flatValidation}
        nodeDef={nodeDef}
        count={nodesUuids?.length}
      />
    </View>
  );
};

ValidationWrapper.defaultProps = {
  nodesUuids: [],
};

ValidationWrapper.defaultProps = {
  showValidation: true,
  absolute: false,
};

export default React.memo(ValidationWrapper, (prevProps, nextProps) => {
  return (
    compareArraysAsSets(prevProps.nodesUuids, nextProps.nodesUuids) &&
    prevProps.nodeDef.uuid === nextProps.nodeDef.uuid
  );
});
