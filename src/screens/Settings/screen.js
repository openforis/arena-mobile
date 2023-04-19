import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View, ScrollView, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import Button from 'arena-mobile-ui/components/Button';
import Header from 'arena-mobile-ui/components/Header';
import Icon from 'arena-mobile-ui/components/Icon';
import Layout from 'arena-mobile-ui/components/Layout';
import baseStyles from 'arena-mobile-ui/styles';
import {useNavigateTo} from 'navigation/hooks';
import {selectors as appSelectors} from 'state/app';
import {selectors as userSelectors} from 'state/user';

import DevMode from './DevMode';
import styles from './styles';
import Version from './Version';

const extractFirstCharacters = (str, numberOfCharacters) => {
  if (str.length <= numberOfCharacters) {
    return str;
  }
  return str.substring(0, numberOfCharacters);
};

const _extractInitials = (value = '') => {
  let _initials = value.split('.');
  if (_initials.length === 0) {
    return '-';
  }
  if (_initials.length === 1) {
    return extractFirstCharacters(_initials[0], 2);
  }
  return (
    extractFirstCharacters(_initials[0], 1) +
    extractFirstCharacters(_initials[1], 1)
  );
};

const SectionWithTitle = ({title, children, subSection = false}) => {
  return (
    <View style={[styles.container, (subSection && {marginTop: 0}: {})]}>
      <View style={{paddingVertical: baseStyles.bases.BASE_2}}>
        <Text style={[baseStyles.textStyle.secondaryText]}>{title}</Text>
      </View>
      {children}
    </View>
  );
};

const SectionCard = ({position = 'middle', onPress, title, iconName}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          styles.sectionCardContainer,
          position === 'first' && styles.sectionCardContainerFirst,
          position === 'last' && styles.sectionCardContainerLast,
          position === 'only' && styles.sectionCardContainerOnly,
        ]}>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={baseStyles.bases.BASE_4} />
        </View>
        <View style={styles.sectionCardTextContainer}>
          <Text style={[baseStyles.textStyle.text]}>{title}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Icon name="chevron-right" size={baseStyles.bases.BASE_8} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Settings = () => {
  const {navigateTo, routes} = useNavigateTo();
  const {t} = useTranslation();

  const user = useSelector(userSelectors.getUser);

  const handleNavigateToConnectionSettings = useCallback(() => {
    navigateTo({route: routes.CONNECTION_SETTINGS})();
  }, [navigateTo, routes]);

  const serverUrl = useSelector(appSelectors.getServerUrl);

  const isDevModeEnabled = useSelector(appSelectors.isDevModeEnabled);

  return (
    <Layout bottomStyle="background" topStyle="primary">
      <>
        <Header hasBackComponent>
          <Text style={[baseStyles.textStyle.title]}>
            {t('Settings:title')}
          </Text>
        </Header>

        <ScrollView>
          <SectionWithTitle title={t('ConnectionSettings:title')}>
            {user?.name ? (
              <TouchableOpacity onPress={handleNavigateToConnectionSettings}>
                <View
                  style={{
                    backgroundColor: 'white',
                    ...baseStyles.card.basicCard,
                    borderWidth: 0,
                    flexDirection: 'row',
                    padding: baseStyles.bases.BASE_4,
                    justifyContent: 'space-between',
                    paddingRight: 0,
                  }}>
                  <View
                    style={{
                      height: baseStyles.bases.BASE_16,
                      width: baseStyles.bases.BASE_16,
                      borderRadius: baseStyles.bases.BASE_16,
                      backgroundColor: colors.alertLightest,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: baseStyles.bases.BASE_6,
                        fontWeight: 'bold',
                      }}>
                      {_extractInitials(user?.email)}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: baseStyles.bases.BASE_4,
                      flexDirection: 'column',
                      justifyContent: 'center',

                      alignItems: 'flex-start',
                      flex: 1,
                    }}>
                    <Text style={[baseStyles.textStyle.text]}>
                      {user?.email}
                    </Text>
                    <Text style={[baseStyles.textStyle.secondaryText]}>
                      {serverUrl}
                    </Text>
                  </View>
                  <View style={styles.iconContainer}>
                    <Icon name="chevron-right" size={baseStyles.bases.BASE_8} />
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <Button
                customContainerStyle={{
                  borderRadius: baseStyles.bases.BASE,
                }}
                onPress={handleNavigateToConnectionSettings}
                type="primary"
                label={t('Settings:connect.cta')}
              />
            )}
          </SectionWithTitle>

          {user?.name ? (
            <>
              <Text style={{paddingLeft: 16}}>
                {t('Settings:survey.title')}
              </Text>
              <SectionWithTitle
                title={t('Settings:survey.taxonomies.title')}
                subSection>
                <SectionCard
                  onPress={navigateTo({
                    route: routes.SETTINGS_SURVEY_TAXONOMIES,
                  })}
                  title={t('Settings:survey.taxonomies.title')}
                  iconName="leaf"
                />
              </SectionWithTitle>
            </>
          ) : null}
          <Version />
          {isDevModeEnabled && user?.name && <DevMode />}

          <View style={styles.dividers} />
        </ScrollView>
      </>
    </Layout>
  );
};

export default Settings;
