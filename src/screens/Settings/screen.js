import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Card from 'arena-mobile-ui/components/Card';
import Header from 'arena-mobile-ui/components/Header';
import Icon from 'arena-mobile-ui/components/Icon';
import Layout from 'arena-mobile-ui/components/Layout';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import baseStyles from 'arena-mobile-ui/styles';
import {useNavigateTo} from 'navigation/hooks';
import {selectors as appSelectors} from 'state/app';
import {actions as formActions} from 'state/form';
import formPreferencesSelectors from 'state/form/selectors/preferences';
import {selectors as userSelectors} from 'state/user';

import DevMode from './DevMode';
import _styles from './styles';
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

const Section = ({title, children, subSection = false}) => {
  const styles = useThemedStyles(_styles);
  const containerStyle = useMemo(() => {
    return StyleSheet.compose(
      styles.container,
      subSection && styles.subSection,
    );
  }, [styles, subSection]);

  return (
    <View style={containerStyle}>
      {title && (
        <View style={{paddingVertical: baseStyles.bases.BASE_2}}>
          <TextBase
            size={subSection ? 'l' : 'xl'}
            type={subSection ? 'secondary' : 'header'}>
            {title}
          </TextBase>
        </View>
      )}
      {children}
    </View>
  );
};

const SectionCard = ({
  position = 'middle',
  onPress,
  title,
  iconName,
  isNavigation = true,
}) => {
  const styles = useThemedStyles(_styles);
  return (
    <TouchableOpacity onPress={onPress}>
      <Card
        customStyles={[
          styles.sectionCardContainer,
          position === 'first' && styles.sectionCardContainerFirst,
          position === 'last' && styles.sectionCardContainerLast,
          position === 'only' && styles.sectionCardContainerOnly,
          position === 'middle' && styles.sectionCardContainerMiddle,
        ]}>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size="s" />
        </View>
        <View style={styles.sectionCardTextContainer}>
          <TextBase>{title}</TextBase>
        </View>
        {isNavigation && (
          <View style={styles.iconContainer}>
            <Icon name="chevron-right" size="l" />
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const FormSettings = () => {
  const dispatch = useDispatch();

  const {t} = useTranslation();

  const hasToJump = useSelector(formPreferencesSelectors.getHasToJump);
  const _updateHasToJump = useCallback(() => {
    dispatch(formActions.setHasToJump({hasToJump: !hasToJump}));
  }, [dispatch, hasToJump]);

  return (
    <Section title={t('Settings:form.title')}>
      <SectionCard
        position="only"
        isNavigation={false}
        onPress={_updateHasToJump}
        title={t('Settings:form.jumpBetweenAttributes.title')}
        iconName={hasToJump ? 'checkbox-marked' : 'checkbox-blank-outline'}
      />
    </Section>
  );
};
const ConnectionSettingsSection = () => {
  const styles = useThemedStyles(_styles);
  const {navigateTo, routes} = useNavigateTo();
  const {t} = useTranslation();

  const user = useSelector(userSelectors.getUser);
  const handleNavigateToConnectionSettings = useCallback(() => {
    navigateTo({route: routes.CONNECTION_SETTINGS})();
  }, [navigateTo, routes]);

  const serverUrl = useSelector(appSelectors.getServerUrl);

  return (
    <Section title={t('ConnectionSettings:title')}>
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
              <TextBase type="secondary">{serverUrl}</TextBase>
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
    </Section>
  );
};

const ImagesQualityAndSizeSettings = () => {
  const {navigateTo, routes} = useNavigateTo();
  const {t} = useTranslation();

  return (
    <Section title={t('Settings:images_quality_and_size.title')}>
      <SectionCard
        position="only"
        onPress={navigateTo({
          route: routes.SETTINGS_IMAGES_QUALITY_AND_SIZE,
        })}
        title={t('Settings:images_quality_and_size.title')}
        iconName="image-outline"
      />
    </Section>
  );
};

const Settings = () => {
  const styles = useThemedStyles(_styles);
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
              <TextBase
                customStyle={styles.textNameTitle}
                size="xl"
                type="header">
                {t('Settings:survey.title')}
              </TextBase>
              <Section title={false} subSection>
                <SectionCard
                  onPress={navigateTo({
                    route: routes.SETTINGS_SURVEY_TAXONOMIES,
                  })}
                  title={t('Settings:survey.taxonomies.title')}
                  iconName="leaf"
                  position="only"
                />
              </Section>

              <Section title={t('Settings:style.title')}>
                <SectionCard
                  position="first"
                  onPress={navigateTo({
                    route: routes.SETTINGS_STYLE_FONT_BASE_MODIFIER,
                  })}
                  title={t('Settings:style.TextAndSpacingSize.title')}
                  iconName="format-size"
                />

                <SectionCard
                  position="last"
                  onPress={navigateTo({
                    route: routes.SETTINGS_STYLE_COLOR_SCHEME,
                  })}
                  title={t('Settings:style.ColorScheme.title')}
                  iconName="theme-light-dark"
                />
              </Section>

              <ImagesQualityAndSizeSettings />
              <FormSettings />
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
