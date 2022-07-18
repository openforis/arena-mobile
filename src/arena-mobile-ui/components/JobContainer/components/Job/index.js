import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text} from 'react-native';

import ProgressBar from '../../../ProgressBar';

import styles, {MAX_WIDTH} from './styles';

const Job = ({job, level = 0, index = 0}) => {
  const {t} = useTranslation();

  return (
    <View>
      {level > 0 ? (
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Text>
              {level > 0 ? `${index + 1}.` : ''} {job.type}
            </Text>
          </View>
          <View style={styles.barContainer}>
            <ProgressBar
              progress={job?.progressPercent}
              success={!job?.failed}
              maxWidth={MAX_WIDTH}
            />
          </View>
        </View>
      ) : (
        <></>
      )}
      {Object.values(job.errors).map(({error}) => (
        <>
          {error.errors.map(_error => (
            <View style={styles.errorContainer}>
              <Text>{t(`Errors:${_error.key}`, _error.params)}</Text>
            </View>
          ))}
        </>
      ))}
      {level < 1 &&
        job.innerJobs.map((innerJob, _index) => (
          <Job
            key={innerJob.type}
            job={innerJob}
            level={level + 1}
            index={_index}
          />
        ))}
    </View>
  );
};

export default Job;
