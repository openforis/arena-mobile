import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Card from 'arena-mobile-ui/components/Card';
import Header from 'arena-mobile-ui/components/Header';
import Icon from 'arena-mobile-ui/components/Icon';
import Layout from 'arena-mobile-ui/components/Layout';
import Slider from 'arena-mobile-ui/components/Slider';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {baseRanges, fontRanges as baseFontRanges} from 'arena-mobile-ui/styles';
import {selectors as appSelectors, actions as appActions} from 'state/app';

import _styles from './styles';

const SettingsStyleFontBaseModifier = () => {
  const styles = useThemedStyles(_styles);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {t} = useTranslation();

  const [initialFontBaseModifier, setInitialFontBaseModifier] = useState(null);
  const [initialBaseModifier, setInitialBaseModifier] = useState(null);

  const fontBaseModifier = useSelector(appSelectors.getFontBaseModifier);
  const [baseFontSizeSelected, setBaseFontSizeSelected] =
    useState(fontBaseModifier);

  const baseModifier = useSelector(appSelectors.getBaseModifier);
  const [baseModifierSelected, setBaseModifierSelected] =
    useState(baseModifier);

  useEffect(() => {
    if (!initialFontBaseModifier) {
      setInitialFontBaseModifier(fontBaseModifier);
    }
  }, [fontBaseModifier, initialFontBaseModifier]);

  useEffect(() => {
    if (baseFontSizeSelected) {
      dispatch(
        appActions.setStyleFontBaseModifier({
          fontBaseModifier: baseFontSizeSelected,
        }),
      );
    }
  }, [dispatch, baseFontSizeSelected]);

  useEffect(() => {
    if (!initialBaseModifier) {
      setInitialBaseModifier(baseModifier);
    }
  }, [baseModifier, initialBaseModifier]);

  useEffect(() => {
    if (baseModifierSelected) {
      dispatch(
        appActions.setStyleBaseModifier({
          baseModifier: baseModifierSelected,
        }),
      );
    }
  }, [dispatch, baseModifierSelected]);

  const handleSave = useCallback(() => {
    dispatch(
      appActions.setStyleFontBaseModifier({
        fontBaseModifier: baseFontSizeSelected,
      }),
    );
    navigation.goBack();
  }, [dispatch, navigation, baseFontSizeSelected]);

  const handleClose = useCallback(() => {
    // reset to initail values
    dispatch(
      appActions.setStyleFontBaseModifier({
        fontBaseModifier: initialFontBaseModifier,
      }),
    );
    dispatch(
      appActions.setStyleBaseModifier({
        baseModifier: initialBaseModifier,
      }),
    );
    navigation.goBack();
  }, [dispatch, navigation, initialFontBaseModifier, initialBaseModifier]);

  return (
    <Layout bottomStyle="background" topStyle="primary">
      <>
        <Header hasBackComponent>
          <Text type="title">
            {t('Settings:style.TextAndSpacingSize.title')}
          </Text>
        </Header>
        <ScrollView>
          <View style={styles.container}>
            <Slider
              title={t(
                'Settings:style.TextAndSpacingSize.screen.textSize.title',
              )}
              info={t('Settings:style.TextAndSpacingSize.screen.textSize.info')}
              value={baseFontSizeSelected}
              onValueChange={setBaseFontSizeSelected}
              minimumValue={baseFontRanges[0]}
              maximumValue={baseFontRanges[baseFontRanges.length - 1]}
              onReset={() => setBaseFontSizeSelected(1)}
              resetLabel={t(
                'Settings:style.TextAndSpacingSize.screen.textSize.reset',
              )}
              LeftComponent={
                <Icon name="format-font-size-decrease" size={40} />
              }
              RightComponent={
                <Icon name="format-font-size-increase" size={40} />
              }
              customSliderContainerStyle={styles.sliderContainer}
              customTitleStyle={styles.title}
              customInfoStyle={styles.info}
            />

            <Slider
              title={t(
                'Settings:style.TextAndSpacingSize.screen.spacingSize.title',
              )}
              info={t(
                'Settings:style.TextAndSpacingSize.screen.spacingSize.info',
              )}
              value={baseModifierSelected}
              onValueChange={setBaseModifierSelected}
              minimumValue={baseRanges[0]}
              maximumValue={baseRanges[baseRanges.length - 1]}
              onReset={() => setBaseModifierSelected(1)}
              resetLabel={t(
                'Settings:style.TextAndSpacingSize.screen.spacingSize.reset',
              )}
              LeftComponent={<Icon name="arrow-collapse" size={40} />}
              RightComponent={<Icon name="arrow-expand" size={40} />}
              customSliderContainerStyle={styles.sliderContainer}
              customTitleStyle={styles.title}
              customInfoStyle={styles.info}
            />
          </View>

          <View style={styles.exampleContainer}>
            <Card>
              {['title', 'header', 'text', 'secondary', 'bold', 'bolder'].map(
                type => (
                  <TextBase key={type} type={type}>
                    {t('Common:preview')} ({type})
                  </TextBase>
                ),
              )}
            </Card>
          </View>

          <View style={styles.buttonsContainer}>
            <Button
              type="ghost"
              onPress={handleClose}
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
