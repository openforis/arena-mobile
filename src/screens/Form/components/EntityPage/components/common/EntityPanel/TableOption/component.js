import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';

import styles from './styles';

const TableOption = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const isEntityShowAsTable = useSelector(formSelectors.isEntityShowAsTable);

  const handleToggleTable = useCallback(() => {
    dispatch(formActions.toggleEntityShowAsTable());
  }, [dispatch]);

  return (
    <>
      <Button
        type="ghost"
        label={t(
          `Form:navigation_panel.table.${
            isEntityShowAsTable ? 'show_as_form' : 'show_as_table'
          }`,
        )}
        customContainerStyle={[styles.buttonContainer]}
        bold={false}
        onPress={handleToggleTable}
      />
    </>
  );
};

export default TableOption;
