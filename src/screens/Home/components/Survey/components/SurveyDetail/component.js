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

const ViewMoreText = ({label, value}) => {
  const [showAll, setShowAll] = useState(false);
  return (
    <View style={{paddingBottom: 18}}>
      <TextBase type="secondary" numberOfLines={showAll ? 0 : 2}>
        {value}
      </TextBase>
      <Pressable
        onPress={() => setShowAll(!showAll)}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
        }}>
        <TextBase type="bold">{showAll ? 'View less' : 'View more'}</TextBase>
      </Pressable>
    </View>
  );
};

const _generateLabel = surveyLabel => {
  const labelSplit = String(surveyLabel)
    .toUpperCase()
    ?.replace(/[^a-zA-Z ]/g, '')
    .split(/\s+/);

  if (labelSplit.length >= 3) {
    return labelSplit[0][0] + labelSplit[1][0] + labelSplit[2][0];
  }

  if (labelSplit.length >= 2) {
    return labelSplit[0][0] + labelSplit[1][0];
  }

  if (labelSplit.length >= 1) {
    return labelSplit[0][0];
  }

  return labelSplit[0];
};

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

    if (numberOfCycles > 1) {
      _info.push({
        label: t('Home:survey.card.cycle'),
        value: `${t('Home:survey.card.cycle_value', {
          numberOfCycles,
          cycle: `${String(Number(surveyCycle) + 1)} (${
            surveyCycles[surveyCycle]?.dateStart
          }${
            surveyCycles[surveyCycle]?.dateEnd
              ? ` - ${surveyCycles[surveyCycle]?.dateEnd}`
              : ''
          })`,
        })}`,
      });
    }

    return _info;
  }, [records]);
  return (
    <View customStyles={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
        <View
          style={{
            justifyContent: 'flex-start',
          }}>
          <View
            style={{
              backgroundColor: 'red',
              height: 64,
              width: 64,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TextBase
              type="secondary"
              customStyle={{
                textAlign: 'center',
                fontWeight: 'bold',
              }}>
              {_generateLabel(surveyLabel)}
            </TextBase>
          </View>
        </View>
        <View
          style={{
            paddingLeft: 8,
            flex: 1,
          }}>
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
