import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useState, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {
  getTaxonItemLabel,
  taxonomyVisibleFieldsOptions,
  exampleTaxon,
  DEFAULT_TAXONOMY_FIELDS,
  getTaxonItemLabelByVernacularName,
  getNumberOfItemsByVernacularNames,
} from 'arena/taxonomy';
import Button from 'arena-mobile-ui/components/Button';
import Header from 'arena-mobile-ui/components/Header';
import Icon from 'arena-mobile-ui/components/Icon';
import Layout from 'arena-mobile-ui/components/Layout';
import Switch from 'arena-mobile-ui/components/Switch';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {selectors as appSelectors, actions as appActions} from 'state/app';

import _styles from './styles';

const Example = ({taxonomyVisibleFields, showOneOptionPerVernacularName}) => {
  const {t} = useTranslation();
  const styles = useThemedStyles(_styles);

  const taxonItemLabels = useMemo(() => {
    const _taxonItemLabels = [];
    if (
      showOneOptionPerVernacularName &&
      taxonomyVisibleFields.includes('vernacularNames')
    ) {
      const numberOfVernacularNames = getNumberOfItemsByVernacularNames({
        item: exampleTaxon,
      });
      for (let i = 0; i < numberOfVernacularNames; i++) {
        _taxonItemLabels.push(
          getTaxonItemLabelByVernacularName({
            item: exampleTaxon,
            taxonomyVisibleFields,
            vernacularPosition: i,
          }),
        );
      }
      return _taxonItemLabels;
    }

    return [
      getTaxonItemLabel({
        item: exampleTaxon,
        taxonomyVisibleFields,
      }),
    ];
  }, [taxonomyVisibleFields, showOneOptionPerVernacularName]);

  return (
    <>
      {taxonItemLabels.map(taxonItemLabel => (
        <View style={styles.exampleContainer} key={taxonItemLabel}>
          <TextBase
            type="secondaryLight"
            size="xs"
            customStyle={styles.exampleDisclaimer}>
            {t('Settings:survey.taxonomies.screen.example')}
          </TextBase>
          <TextBase type="header" customStyle={styles.exampleTaxonItemLabel}>
            {taxonItemLabel}
          </TextBase>
        </View>
      ))}
    </>
  );
};

const SettingsSurveyTaxonomies = () => {
  const styles = useThemedStyles(_styles);
  const [taxonomyVisibleFieldsKey, setTaxonomyVisibleFieldsKey] = useState(
    DEFAULT_TAXONOMY_FIELDS,
  );
  const [showOneOptionPerVernacularName, setShowOneOptionPerVernacularName] =
    useState(false);

  const defaultVisibleFields = useSelector(
    appSelectors.getSettingsPreferencesSurveyTaxonomiesDefaultVisibleFields,
  );
  const defaultShowOneOptionPerVernacularName = useSelector(
    appSelectors.getSettingsPreferencesSurveyTaxonomiesShowOneOptionPerVernacularName,
  );

  useEffect(() => {
    if (defaultVisibleFields) {
      setTaxonomyVisibleFieldsKey(
        defaultVisibleFields.join('.') || DEFAULT_TAXONOMY_FIELDS,
      );
    }
  }, [defaultVisibleFields]);
  useEffect(() => {
    if (defaultShowOneOptionPerVernacularName) {
      setShowOneOptionPerVernacularName(defaultShowOneOptionPerVernacularName);
    }
  }, [defaultShowOneOptionPerVernacularName]);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {t} = useTranslation();

  const handleSave = useCallback(() => {
    dispatch(
      appActions.setSettingsPreferencesSurveyTaxonomiesDefaultVisibleFields({
        defaultVisibleFields: taxonomyVisibleFieldsKey.split('.'),
      }),
    );
    dispatch(
      appActions.setSettingsPreferencesSurveyTaxonomiesShowOneOptionPerVernacularName(
        {
          showOneOptionPerVernacularName,
        },
      ),
    );
    navigation.goBack();
  }, [
    dispatch,
    navigation,
    taxonomyVisibleFieldsKey,
    showOneOptionPerVernacularName,
  ]);

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

            <TextBase type="secondaryLight">
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
            <Switch
              title={t(
                'Settings:survey.taxonomies.screen.show_one_option_per_vernacular_name',
              )}
              value={showOneOptionPerVernacularName}
              onValueChange={() =>
                setShowOneOptionPerVernacularName(
                  !showOneOptionPerVernacularName,
                )
              }
              customContainerStyle={
                styles.showOneOptionPerVernacularNameSwitchContainer
              }
              disabled={!taxonomyVisibleFieldsKey.includes('vernacularNames')}
            />
          </View>

          <Example
            taxonomyVisibleFields={
              taxonomyVisibleFieldsOptions[taxonomyVisibleFieldsKey]
            }
            showOneOptionPerVernacularName={showOneOptionPerVernacularName}
          />

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
