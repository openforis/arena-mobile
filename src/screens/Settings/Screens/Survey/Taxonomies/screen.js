import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View, ScrollView, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';

import {
  getTaxonItemLabel,
  taxonomyVisibleFieldsOptions as options,
  exampleTaxonomy,
} from 'arena/taxonomy';
import * as colors from 'arena-mobile-ui/colors';
import Button from 'arena-mobile-ui/components/Button';
import Header from 'arena-mobile-ui/components/Header';
import Icon from 'arena-mobile-ui/components/Icon';
import Layout from 'arena-mobile-ui/components/Layout';
import baseStyles from 'arena-mobile-ui/styles';
import {selectors as appSelectors} from 'state/app';

import styles from './styles';

const SettingsSurveyTaxonomies = () => {
  const [taxonomyVisibleFields, setTaxonomyVisibleFields] = useState(
    options[0].key,
  );
  const navigation = useNavigation();

  const {t} = useTranslation();

  const handleSave = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
            <Text style={baseStyles.textStyle.header}>Taxonomy</Text>
            <Text style={baseStyles.textStyle.info}>
              How do you want to see the taxonomy?
            </Text>

            {options?.map((option, index) => (
              <TouchableOpacity
                key={option.key}
                style={{
                  backgroundColor: colors.white,
                  padding: 16,
                  borderBottomColor: colors.neutralLighter,
                  borderBottomWidth: 0.5,
                  flexDirection: 'row',

                  ...(index === 0 && {
                    marginTop: 20,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }),
                  ...(index === options.length - 1 && {
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    borderBottomWidth: 0,
                  }),
                  ...(taxonomyVisibleFields === option.key && {
                    backgroundColor: colors.secondaryLighter,
                  }),
                }}
                onPress={() => setTaxonomyVisibleFields(option.key)}>
                <Icon
                  name={
                    taxonomyVisibleFields === option.key
                      ? 'checkbox-marked'
                      : 'checkbox-blank-outline'
                  }
                  size={16}
                />
                <Text
                  style={{
                    ...(taxonomyVisibleFields === option.key && {
                      fontWeight: 'bold',
                    }),
                    marginLeft: baseStyles.bases.BASE_2,
                  }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.exampleContainer}>
            <Text style={styles.example}>
              {getTaxonItemLabel({
                item: exampleTaxonomy,
                taxonomyVisibleFields: options.find(
                  option => option.key === taxonomyVisibleFields,
                ).value,
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
