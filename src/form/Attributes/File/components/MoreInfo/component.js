import React, {useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const MoreInfo = ({node}) => {
  const styles = useThemedStyles(_styles);
  const [collapsed, setCollapsed] = useState(false);
  const {t} = useTranslation();
  const toggleCollapsed = useCallback(() => {
    setCollapsed(prevValue => !prevValue);
  }, [setCollapsed]);
  return (
    <View style={styles.container}>
      <Button
        type="ghostBlack"
        icon={<Icon name={collapsed ? 'chevron-down' : 'chevron-right'} />}
        label={
          collapsed
            ? t('Form:nodeDefFile.more_info.hide_detail')
            : t('Form:nodeDefFile.more_info.show_detail')
        }
        onPress={toggleCollapsed}
      />
      {collapsed && (
        <>
          <LabelsAndValues
            items={Object.entries(node?.value || {})
              .filter(([label]) => !(label === 'exif'))
              .map(([label, value]) => ({
                label,
                value:
                  label === 'exif'
                    ? JSON.stringify(value || '-', null, 2)
                    : String(value) || '-',
              }))}
          />
          {node?.value?.exif && (
            <>
              <TextBase type="bold">
                {t('Form:nodeDefFile.more_info.exif')}
              </TextBase>
              <TextBase style={styles.exifDescription}>
                {JSON.stringify(node?.value?.exif || {}, null, 2)}
              </TextBase>
            </>
          )}
        </>
      )}
    </View>
  );
};

export default MoreInfo;
