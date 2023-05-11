import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {
  getTaxonItemLabel,
  taxonomyVisibleFieldsOptions,
  exampleTaxon,
  DEFAULT_TAXONOMY_FIELDS,
} from 'arena/taxonomy';
import Button from 'arena-mobile-ui/components/Button';
import Header from 'arena-mobile-ui/components/Header';
import Icon from 'arena-mobile-ui/components/Icon';
import Layout from 'arena-mobile-ui/components/Layout';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as appSelectors, actions as appActions} from 'state/app';

import _styles from './styles';

const SettingsStyleFontBaseModifier = () => {
  const styles = useThemedStyles({styles: _styles});
  const [taxonomyVisibleFieldsKey, setTaxonomyVisibleFieldsKey] = useState(
    DEFAULT_TAXONOMY_FIELDS,
  );

  const defaultVisibleFields = useSelector(
    appSelectors.getSettingsPreferencesSurveyTaxonomiesDefaultVisibleFields,
  );

  useEffect(() => {
    if (defaultVisibleFields) {
      setTaxonomyVisibleFieldsKey(
        defaultVisibleFields.join('.') || DEFAULT_TAXONOMY_FIELDS,
      );
    }
  }, [defaultVisibleFields]);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {t} = useTranslation();

  const handleSave = useCallback(() => {
    dispatch(
      appActions.setSettingsPreferencesSurveyTaxonomiesDefaultVisibleFields({
        defaultVisibleFields: taxonomyVisibleFieldsKey.split('.'),
      }),
    );
    navigation.goBack();
  }, [dispatch, navigation, taxonomyVisibleFieldsKey]);

  return (
    <Layout bottomStyle="background" topStyle="primary">
      <>
        <Header hasBackComponent>
          <TextBase type="title">
            {t('Settings:survey.taxonomies.title')}
          </TextBase>
        </Header>
        <ScrollView>
          <View style={styles.container}>
            <TextBase type="header">
              {t('Settings:survey.taxonomies.screen.header')}
            </TextBase>

            <TextBase>
              {t('Settings:survey.taxonomies.screen.description')}
            </TextBase>

            {Object.entries(taxonomyVisibleFieldsOptions).map(
              (option, index) => {
                const [optionKey, optionValue] = option;
                const isSelected = taxonomyVisibleFieldsKey === optionKey;

                return (
                  <TouchableOpacity
                    key={optionKey}
                    style={[
                      styles.optionContainer,
                      index === 0 && styles.optionContainerFirst,
                      index ===
                        Object.values(taxonomyVisibleFieldsOptions).length -
                          1 && styles.optionContainerLast,
                      taxonomyVisibleFieldsKey === optionKey &&
                        styles.optionContainerSelected,
                    ]}
                    onPress={() => setTaxonomyVisibleFieldsKey(optionKey)}>
                    <Icon
                      name={
                        isSelected
                          ? 'checkbox-marked'
                          : 'checkbox-blank-outline'
                      }
                      color={isSelected && styles.optionTextSelected?.color}
                      size="s"
                    />
                    <TextBase
                      customStyle={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}>
                      {optionValue
                        .map(field => {
                          return t(
                            `Settings:survey.taxonomies.screen.fields.${field}`,
                          );
                        })
                        .join(', ')}
                    </TextBase>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
          <View style={styles.exampleContainer}>
            <TextBase type="header" customStyle={styles.exampleTitle}>
              {getTaxonItemLabel({
                item: exampleTaxon,
                taxonomyVisibleFields:
                  taxonomyVisibleFieldsOptions[taxonomyVisibleFieldsKey],
              })}
            </TextBase>
          </View>

          <View style={styles.buttonsContainer}>
            <Button
              type="ghost"
              onPress={navigation.goBack}
              label={t('Common:cancel')}
            />
            <Button
              type="primary"
              onPress={handleSave}
              label={t('Common:save')}
            />
          </View>
        </ScrollView>
      </>
    </Layout>
  );
};

export default SettingsStyleFontBaseModifier;
