import React, {useEffect, useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import baseStyles from 'arena-mobile-ui/styles';
import ws from 'infra/ws';
import surveyActions from 'state/survey/actionCreators';
import surveySelectors from 'state/survey/selectors';

import Button from '../Button';
import ProgressBar from '../ProgressBar';

import Header from './components/Header';
import Job from './components/Job';
import styles from './styles';

const JobContainer = () => {
  const {t} = useTranslation();
  const [collapsed, setCollapsed] = useState(true);
  const isUploading = useSelector(surveySelectors.getIsUploading);
  const uploadProgress = useSelector(surveySelectors.getUploadProgress);
  const job = useSelector(surveySelectors.getJob);

  const dispatch = useDispatch();

  useEffect(() => {
    if (job.ended) {
      setCollapsed(false);
    }
  }, [job.ended]);

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
        <>
          <ProgressBar
            progress={Math.min(
              job?.progressPercent || 1,
              uploadProgress || 100,
            )}
            height={baseStyles.bases.BASE_3}
            main={true}
            success={!job?.failed}
          />

          {job && <Header collapsed={collapsed} setCollapsed={setCollapsed} />}

          {job && !collapsed && (
            <>
              <ScrollView style={styles.scrollContainer}>
                <Job job={job} />
              </ScrollView>
              <Button
                label={t('Common:close')}
                type="ghost"
                customContainerStyle={styles.closeButton}
                onPress={handleClose}
              />
            </>
          )}
        </>
      </View>
    </View>
  );
};

export default JobContainer;
