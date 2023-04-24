import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View, ScrollView, TouchableOpacity} from 'react-native';
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
import baseStyles from 'arena-mobile-ui/styles';
import {selectors as appSelectors, actions as appActions} from 'state/app';

import styles from './styles';

const SettingsSurveyTaxonomies = () => {
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
          <Text style={[baseStyles.textStyle.title]}>
            {t('Settings:survey.taxonomies.title')}
          </Text>
        </Header>
        <ScrollView>
          <View style={styles.container}>
            <Text style={baseStyles.textStyle.header}>
              {t('Settings:survey.taxonomies.screen.header')}
            </Text>
            <Text style={baseStyles.textStyle.info}>
              {t('Settings:survey.taxonomies.screen.description')}
            </Text>
            <Text style={baseStyles.textStyle.info}>
              {t('Settings:survey.taxonomies.screen.info')}
            </Text>

            {Object.entries(taxonomyVisibleFieldsOptions)?.map(
              (option, index) => {
                const [optionKey, optionValue] = option;
                const isSelected = taxonomyVisibleFieldsKey === optionKey;
                return (
                  <TouchableOpacity
                    key={optionKey}
                    style={[
                      styles.optionContainer,
                      index === 0 && styles.optionContainerFirst,
                      index === taxonomyVisibleFieldsOptions.length - 1 &&
                        styles.optionContainerLast,
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
                      size={baseStyles.bases.BASE_4}
                    />
                    <Text
                      style={[
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
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
          <View style={styles.exampleContainer}>
            <Text style={styles.example}>
              {getTaxonItemLabel({
                item: exampleTaxon,
                taxonomyVisibleFields:
                  taxonomyVisibleFieldsOptions[taxonomyVisibleFieldsKey],
              })}
            </Text>
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

export default SettingsSurveyTaxonomies;
