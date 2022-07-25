import React, {useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import LabelsAndValues from 'arena-mobile-ui/components/LabelsAndValues';

import style from './styles';

const MoreInfo = ({node}) => {
  const [collapsed, setCollapsed] = useState(false);
  const {t} = useTranslation();
  const toggleCollapsed = useCallback(() => {
    setCollapsed(prevValue => !prevValue);
  }, [setCollapsed]);
  return (
    <View style={style.container}>
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
        <LabelsAndValues
          items={Object.entries(node.value).map(([label, value]) => ({
            label,
            value: String(value) || '-',
          }))}
        />
      )}
    </View>
  );
};

export default MoreInfo;
