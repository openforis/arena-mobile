import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import formActions from 'state/form/actionCreators';
import formSelectors from 'state/form/selectors';

import _styles from './styles';

const TableOption = ({withIcon}) => {
  const {t} = useTranslation();
  const styles = useThemedStyles(_styles);
  const dispatch = useDispatch();

  const nodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  const isEntityShowAsTable = useSelector(formSelectors.isEntityShowAsTable);

  const handleToggleTable = useCallback(() => {
    dispatch(formActions.toggleEntityShowAsTable());
  }, [dispatch]);

  return (
    <Button
      type="ghost"
      label={`${t(
        `Form:navigation_panel.table.${
          isEntityShowAsTable ? 'show_as_form' : 'show_as_table'
        }`,
      )} - (${nodes.length})`}
      customContainerStyle={styles.buttonContainer}
      onPress={handleToggleTable}
      icon={
        withIcon ? (
          <Icon
            name={isEntityShowAsTable ? 'format-list-checks' : 'table-large'}
            size="s"
          />
        ) : null
      }
      iconPosition="right"
    />
  );
};

TableOption.defaultProps = {
  withIcon: false,
};

export default TableOption;
