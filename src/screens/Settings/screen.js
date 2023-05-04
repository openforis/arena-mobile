import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Card from 'arena-mobile-ui/components/Card';
import Header from 'arena-mobile-ui/components/Header';
import Icon from 'arena-mobile-ui/components/Icon';
import Layout from 'arena-mobile-ui/components/Layout';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
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
        <TextBase type="secondaryText">{title}</TextBase>
      </View>
      {children}
    </View>
  );
};

const SectionCard = ({position = 'middle', onPress, title, iconName}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card
        customStyles={[
          styles.sectionCardContainer,
          position === 'first' && styles.sectionCardContainerFirst,
          position === 'last' && styles.sectionCardContainerLast,
          position === 'only' && styles.sectionCardContainerOnly,
        ]}>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size="s" />
        </View>
        <View style={styles.sectionCardTextContainer}>
          <TextBase>{title}</TextBase>
        </View>
        <View style={styles.iconContainer}>
          <Icon name="chevron-right" size="l" />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const ConnectionSettingsSection = () => {
  const {navigateTo, routes} = useNavigateTo();
  const {t} = useTranslation();

  const user = useSelector(userSelectors.getUser);
  const handleNavigateToConnectionSettings = useCallback(() => {
    navigateTo({route: routes.CONNECTION_SETTINGS})();
  }, [navigateTo, routes]);

  const serverUrl = useSelector(appSelectors.getServerUrl);

  return (
    <SectionWithTitle title={t('ConnectionSettings:title')}>
      {user?.name ? (
        <TouchableOpacity onPress={handleNavigateToConnectionSettings}>
          <Card customStyles={styles.connectionSettingsContainer}>
            <View style={styles.connectionSettingsContainerIcon}>
              <TextBase
                customStyle={styles.connectionSettingsContainerIconText}>
                {_extractInitials(user?.email)}
              </TextBase>
            </View>
            <View style={styles.connectionSettingsContainerText}>
              <TextBase>{user?.email}</TextBase>
              <TextBase type="secondaryText">{serverUrl}</TextBase>
            </View>
            <View style={styles.iconContainer}>
              <Icon name="chevron-right" size="l" />
            </View>
          </Card>
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
  );
};

const Settings = () => {
  const {navigateTo, routes} = useNavigateTo();
  const {t} = useTranslation();

  const user = useSelector(userSelectors.getUser);

  const isDevModeEnabled = useSelector(appSelectors.isDevModeEnabled);

  return (
    <Layout bottomStyle="background" topStyle="primary">
      <>
        <Header hasBackComponent>
          <TextBase type="title">{t('Settings:title')}</TextBase>
        </Header>

        <ScrollView>
          <ConnectionSettingsSection />
          {user?.name ? (
            <>
              <TextBase customStyle={styles.textNameTitle}>
                {t('Settings:survey.title')}
              </TextBase>
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
