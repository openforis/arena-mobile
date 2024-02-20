import moment from 'moment-timezone';
import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, View} from 'react-native';
import {useSelector} from 'react-redux';

import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import TextTitle from 'arena-mobile-ui/components/Texts/TextTitle';

import {selectors as surveySelectors} from 'state/survey';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import _styles from './styles';
import {Divider} from 'react-native-elements';

const SHOW_CYCLE_SELECTOR = false;

import SurveyCycleSelector from '../SurveyCycleSelector';
import SurveyLanguageSelector from '../SurveyLanguageSelector';

const ViewMoreText = ({value}) => {
  const styles = useThemedStyles(_styles);
  const [showAll, setShowAll] = useState(false);
  const {t} = useTranslation();
  return (
    <View style={styles.viewMoreContainer}>
      <TextBase type="secondary" numberOfLines={showAll ? 0 : 2}>
        {value}
      </TextBase>
      <Pressable
        onPress={() => setShowAll(!showAll)}
        style={styles.viewMoreButton}>
        <TextBase type="bold">
          {showAll ? t('Common:view_less') : t('Common:view_more')}
        </TextBase>
      </Pressable>
    </View>
  );
};

const _extractInitials = surveyLabel =>
  String(surveyLabel)
    .toUpperCase()
    .replace(/[^a-zA-Z ]/g, '')
    .split(/\s+/)
    .slice(0, 3)
    .map(part => part[0])
    .join('');

const SurveyDetail = () => {
  const styles = useThemedStyles(_styles);
  const {t} = useTranslation();

  const survey = useSelector(surveySelectors.getSurvey);
  const surveyCycles = useSelector(surveySelectors.getSurveyCycles);
  const records = useSelector(surveySelectors.getRecords);

  const {
    name: surveyName,
    label: surveyLabel,
    cycle: surveyCycle,
    description: surveyDescription,
    numberOfCycles,
  } = useSelector(surveySelectors.getSurveyData);

  const info = useMemo(() => {
    const _info = [
      {
        label: t('Common:created'),
        value: moment(survey.dateCreated).fromNow(),
      },
      {
        label: t('Common:modified'),
        value: moment(survey.dateModified).fromNow(),
      },
    ];

    const currentCycle = surveyCycles[surveyCycle];
    const cycleDatesFromTo = `(${currentCycle?.dateStart}${currentCycle?.dateEnd ? ` - ${currentCycle?.dateEnd}` : ''})`;

    if (numberOfCycles > 1) {
      _info.push({
        label: t('Home:survey.card.cycle'),
        value: `${t('Home:survey.card.cycle_value', {
          numberOfCycles,
          cycle: `${String(Number(surveyCycle) + 1)} ${cycleDatesFromTo}`,
        })}`,
      });
    }

    return _info;
  }, [records]);
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.initialsContainer}>
          <View style={styles.initialsBox}>
            <TextBase type="secondary" customStyle={styles.initialsText}>
              {_extractInitials(surveyLabel)}
            </TextBase>
          </View>
        </View>
        <View style={styles.headerLabelAndName}>
          <TextBase type="secondary" size="xs">
            {t('Home:survey.card.active_survey')}
          </TextBase>
          <TextTitle size="xxl">{surveyLabel}</TextTitle>
          <TextBase type="secondary">
            {t('Home:survey.card.name')}: {surveyName}
          </TextBase>
        </View>
      </View>

      <Divider style={styles.divider} />

      {surveyDescription && <ViewMoreText value={surveyDescription} />}

      <LabelsAndValues size="m" items={info} />
      <SurveyLanguageSelector />
      {SHOW_CYCLE_SELECTOR && <SurveyCycleSelector />}
    </View>
  );
};

export default SurveyDetail;
