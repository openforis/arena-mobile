import React, {useEffect, useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView, Dimensions} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import baseStyles from 'arena-mobile-ui/styles';
import ws from 'infra/ws';
import appSelectors from 'state/app/selectors';
import surveyActions from 'state/survey/actionCreators';
import surveySelectors from 'state/survey/selectors';

import useThemedStyles from '../../hooks/useThemedStyles';
import Button from '../Button';
import ProgressBar from '../ProgressBar';
import TextBase from '../Texts/TextBase';
import TextTitle from '../Texts/TextTitle';

import Header from './components/Header';
import Job from './components/Job';
import _styles from './styles';

const {width} = Dimensions.get('screen');

const JobContainer = () => {
  const styles = useThemedStyles(_styles);
  const {t} = useTranslation();
  const [collapsed, setCollapsed] = useState(true);
  const isUploading = useSelector(surveySelectors.getIsUploading);
  const uploadProgress = useSelector(surveySelectors.getUploadProgress);
  const job = useSelector(surveySelectors.getJob);
  const isDevModeEnabled = useSelector(appSelectors.isDevModeEnabled);

  const dispatch = useDispatch();

  useEffect(() => {
    if (job?.ended) {
      setCollapsed(false);
    }
  }, [job]);

  const handleClose = useCallback(() => {
    dispatch(surveyActions.updateJob({job: false}));
    dispatch(surveyActions.setUploading({isUploading: false}));
    ws().destroy();
  }, [dispatch]);
  if (!isUploading && !job) {
    return <></>;
  }
  return (
    <View style={styles.jobContainer}>
      <View style={styles.container}>
        <TextTitle>
          {job?.ended
            ? t('Records:job_sending_records.done.title')
            : t('Records:job_sending_records.sending.title')}
        </TextTitle>
        <TextBase>
          {job?.ended
            ? t('Records:job_sending_records.done.info')
            : t('Records:job_sending_records.sending.info')}
        </TextBase>

        {isDevModeEnabled && (
          <>
            {job && (
              <Header collapsed={collapsed} setCollapsed={setCollapsed} />
            )}

            {job && !collapsed && (
              <>
                <ScrollView style={styles.scrollContainer}>
                  <Job job={job} />
                </ScrollView>
                <Button
                  label={t('Common:ok')}
                  type="ghost"
                  customContainerStyle={styles.closeButton}
                  onPress={handleClose}
                />
              </>
            )}
          </>
        )}

        <View style={styles.barContainer}>
          <ProgressBar
            progress={Math.min(
              job?.progressPercent || 1,
              uploadProgress || 100,
            )}
            height={baseStyles.bases.BASE_3}
            main={true}
            success={!job?.failed}
            maxWidth={width - 24 - 2 * baseStyles.bases.BASE_3}
          />
        </View>

        {job.ended && (
          <Button
            label={t('Common:close')}
            type="ghost"
            customContainerStyle={styles.closeButton}
            onPress={handleClose}
          />
        )}
      </View>
    </View>
  );
};

export default JobContainer;
