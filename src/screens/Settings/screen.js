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

const Settings = () => {
  const {navigateTo, routes} = useNavigateTo();
  const {t} = useTranslation();

  const user = useSelector(userSelectors.getUser);

  const handleNavigateToConnectionSettings = useCallback(() => {
    navigateTo({route: routes.CONNECTION_SETTINGS})();
  }, [navigateTo]);

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
          <View style={[styles.container]}>
            <View style={{paddingVertical: baseStyles.bases.BASE_2}}>
              <Text style={[baseStyles.textStyle.secondaryText]}>
                {t('ConnectionSettings:title')}
              </Text>
            </View>
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
                  <View
                    style={{
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
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
          </View>
          <Version />
          {isDevModeEnabled && user?.name && <DevMode />}

          <View style={styles.dividers} />
        </ScrollView>
      </>
    </Layout>
  );
};

export default Settings;
